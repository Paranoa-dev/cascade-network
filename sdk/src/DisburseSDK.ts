/**
 * DisburseSDK — main entry point for the Cascade Network SDP extension.
 *
 * Orchestrates the full disbursement lifecycle:
 *   pre-disbursement hooks → rails → post-disbursement hooks
 *
 * @example
 * ```typescript
 * import { DisburseSDK } from '@cascade-network/sdk'
 *
 * const sdk = new DisburseSDK({
 *   sdpEndpoint: 'https://sdp.myorg.com',
 *   network: 'testnet',
 * })
 *
 * // Register a KYC hook
 * sdk.hooks.register({
 *   event: 'pre-disbursement',
 *   name: 'kyc-check',
 *   handler: async (ctx) => {
 *     const ok = await kycProvider.check(ctx.receiverWalletId)
 *     if (!ok) throw new Error(`KYC not approved for ${ctx.receiverWalletId}`)
 *   },
 * })
 *
 * // Send a payment
 * const result = await sdk.disburse({
 *   receiverWalletId: 'GABC...XYZ',
 *   amountUsdc: 100,
 *   asset: 'USDC',
 *   memo: 'Aid payment Q2',
 * })
 * console.log(result.txRef)
 * ```
 */
import { HookRegistry } from './hooks/HookRegistry'
import { RailsAdapter }  from './rails/types'
import { CascadeRailsAdapter } from './rails/StellarRailsAdapter'
import { ConditionalPaymentClient } from './api/ConditionalPaymentClient'

export interface DisburseSDKConfig {
  /** Base URL of your Stellar Disbursement Platform instance */
  sdpEndpoint: string
  /** SDP API bearer token (set via SDP_AUTH_TOKEN env var in production) */
  authToken?: string
  /** Stellar RPC URL — defaults to sdpEndpoint for backwards compat */
  rpcUrl?: string
  network?: 'mainnet' | 'testnet'
  conditionalPaymentContractId?: string
}

export interface DisburseParams {
  receiverWalletId: string
  amountUsdc: number
  asset?: string
  memo?: string
  conditionId?: string
}

export interface DisburseResult {
  success: boolean
  txRef: string
  errorMessage?: string
  /** Timestamp of the disbursement attempt */
  attemptedAt: string
  /** Which rails adapter handled this payment */
  adapter: string
}

export interface BatchResult extends DisburseResult {
  receiverWalletId: string
  index: number
}

export class DisburseSDK {
  readonly hooks: HookRegistry
  readonly conditionalPayment: ConditionalPaymentClient
  private rails: RailsAdapter
  private config: DisburseSDKConfig

  constructor(config: DisburseSDKConfig) {
    this.config = config
    this.hooks  = new HookRegistry()
    this.rails  = new CascadeRailsAdapter(config.sdpEndpoint, config.authToken)
    this.conditionalPayment = new ConditionalPaymentClient({
      contractId: config.conditionalPaymentContractId ?? '',
      network:    config.network ?? 'testnet',
      rpcUrl:     config.rpcUrl,
    })
  }

  /**
   * Replace the default Stellar SDP rails with any custom adapter.
   * @example sdk.useRails(new MpesaAdapter(mpesaConfig))
   */
  useRails(adapter: RailsAdapter): this {
    this.rails = adapter
    console.log(`[DisburseSDK] rails → ${adapter.name}`)
    return this
  }

  /**
   * Execute a single disbursement through the full hook + rails lifecycle.
   *
   * Lifecycle:
   *   1. pre-disbursement hooks  (KYC, sanctions, balance checks)
   *   2. rails.disburse()        (SDP, M-Pesa, or custom adapter)
   *   3. post-disbursement hooks (analytics, notifications)
   *   on failure → on-failure hooks (alerts, retry queuing)
   *
   * If ANY pre-disbursement hook throws, the payment is aborted and
   * on-failure hooks are called instead. The payment never reaches the rails.
   */
  async disburse(params: DisburseParams): Promise<DisburseResult> {
    const attemptedAt = new Date().toISOString()
    const ctx = {
      receiverWalletId: params.receiverWalletId,
      amountUsdc:       params.amountUsdc,
      asset:            params.asset ?? 'USDC',
      conditionId:      params.conditionId,
    }

    // ── Step 1: pre-disbursement hooks ──────────────────────────────────────
    try {
      await this.hooks.run('pre-disbursement', ctx)
    } catch (err: any) {
      const msg = `pre-disbursement hook '${err.hookName ?? 'unknown'}' failed: ${err.message}`
      console.warn(`[DisburseSDK] ${msg}`)
      await this.hooks.run('on-failure', { ...ctx, metadata: { error: err.message, stage: 'pre-disbursement' } })
        .catch(() => {})  // non-fatal
      return { success: false, txRef: '', errorMessage: msg, attemptedAt, adapter: this.rails.name }
    }

    // ── Step 2: rails ────────────────────────────────────────────────────────
    let railsResult: { success: boolean; txRef: string; errorMessage?: string }
    try {
      railsResult = await this.rails.disburse({
        receiverWalletId: params.receiverWalletId,
        amountUsdc:       params.amountUsdc,
        asset:            params.asset ?? 'USDC',
        memo:             params.memo,
        conditionId:      params.conditionId,
      })
    } catch (err: any) {
      const msg = `rails error (${this.rails.name}): ${err.message}`
      console.error(`[DisburseSDK] ${msg}`)
      await this.hooks.run('on-failure', { ...ctx, metadata: { error: err.message, stage: 'rails' } })
        .catch(() => {})
      return { success: false, txRef: '', errorMessage: msg, attemptedAt, adapter: this.rails.name }
    }

    // ── Step 3: post-disbursement hooks (non-fatal) ──────────────────────────
    if (railsResult.success) {
      await this.hooks
        .run('post-disbursement', { ...ctx, metadata: { txRef: railsResult.txRef } })
        .catch(err => console.warn(`[DisburseSDK] post-disbursement hook warning: ${err.message}`))
    } else {
      await this.hooks
        .run('on-failure', { ...ctx, metadata: { txRef: railsResult.txRef, stage: 'rails-rejected' } })
        .catch(() => {})
    }

    return { ...railsResult, attemptedAt, adapter: this.rails.name }
  }

  /**
   * Execute multiple disbursements concurrently.
   * Returns one result per payment — failures are reported per-row, not thrown.
   *
   * Concurrency is bounded by Promise.allSettled (all run in parallel).
   * For very large batches (>100) consider chunking to avoid SDP rate limits.
   */
  async disburseBatch(payments: DisburseParams[]): Promise<BatchResult[]> {
    console.log(`[DisburseSDK] disburseBatch — ${payments.length} payments via ${this.rails.name}`)
    const results = await Promise.allSettled(payments.map(p => this.disburse(p)))
    return results.map((r, i) => ({
      receiverWalletId: payments[i].receiverWalletId,
      index: i,
      ...(r.status === 'fulfilled'
        ? r.value
        : {
            success: false,
            txRef: '',
            errorMessage: (r.reason as Error).message,
            attemptedAt: new Date().toISOString(),
            adapter: this.rails.name,
          }),
    }))
  }

  /**
   * Query the status of a prior disbursement by rails reference.
   */
  async status(txRef: string) {
    return this.rails.status(txRef)
  }

  /**
   * Health check — verifies SDP connectivity and hook registration.
   */
  healthCheck(): { sdpEndpoint: string; adapter: string; hooks: number; network: string } {
    return {
      sdpEndpoint: this.config.sdpEndpoint,
      adapter:     this.rails.name,
      hooks:       this.hooks.list().length,
      network:     this.config.network ?? 'testnet',
    }
  }
}
