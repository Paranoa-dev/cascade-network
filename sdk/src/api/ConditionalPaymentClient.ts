/**
 * ConditionalPaymentClient — SDK for the cascade-network conditional_payment Soroban contract.
 *
 * XDR pattern: method() → buildUnsignedXdr() → caller signs with Freighter → submitSignedXdr()
 * Oracle-confirm calls are signed by the oracle machine keypair (no Freighter needed server-side).
 */
import { buildUnsignedXdr, submitSignedXdr, waitForConfirmation, StellarNetwork, XDRResult, SubmitResult } from '../stellar'

const STROOPS_PER_USDC = 10_000_000n
const LEDGERS_PER_DAY  = 17_280

export type PaymentStatus = 'Pending' | 'Released' | 'Refunded' | 'Cancelled'

export interface PaymentRecord {
  id: bigint
  payer: string
  payee: string
  oracle: string
  amountUsdc: number
  conditionId: string
  timeoutLedger: number
  status: PaymentStatus
}

export interface DepositParams {
  payer: string
  payee: string
  oracle: string
  amountUsdc: number
  conditionId: string
  timeoutDays: number
}

export interface ConditionalPaymentClientConfig {
  contractId: string
  network: StellarNetwork
  rpcUrl?: string
}

export class ConditionalPaymentClient {
  private config: ConditionalPaymentClientConfig

  constructor(config: ConditionalPaymentClientConfig) {
    this.config = config
  }

  /**
   * Payer deposits funds. Returns unsigned XDR for payer to sign with Freighter.
   *
   * @example
   * const { unsignedXdr } = await client.deposit({ payer, payee, oracle, amountUsdc: 200, conditionId: 'INV-001', timeoutDays: 14 })
   * const signed = await freighter.signTransaction(unsignedXdr, { network: 'TESTNET' })
   * const { txHash } = await client.submit(signed)
   */
  async deposit(params: DepositParams): Promise<XDRResult> {
    const amountStroops  = BigInt(Math.round(params.amountUsdc * Number(STROOPS_PER_USDC)))
    const timeoutLedgers = params.timeoutDays * LEDGERS_PER_DAY

    console.log(
      `[ConditionalPaymentClient] deposit conditionId=${params.conditionId} ` +
      `amount=${params.amountUsdc} USDC timeout=${params.timeoutDays}d`
    )

    return buildUnsignedXdr({
      contractId: this.config.contractId,
      functionName: 'deposit',
      args: [
        { type: 'address', value: params.payer },
        { type: 'address', value: params.payee },
        { type: 'address', value: params.oracle },
        { type: 'i128',    value: amountStroops },
        { type: 'string',  value: params.conditionId },
        { type: 'u32',     value: timeoutLedgers },
      ],
      network: this.config.network,
      rpcUrl:  this.config.rpcUrl,
      sourcePublicKey: params.payer,
    })
  }

  /**
   * Oracle confirms the condition — releases funds to payee.
   * Signed by the oracle machine keypair (not the user's Freighter wallet).
   * Returns unsigned XDR for the oracle server to sign with its keypair.
   */
  async confirm(id: bigint, oraclePublicKey: string): Promise<XDRResult> {
    console.log(`[ConditionalPaymentClient] confirm id=${id} oracle=${oraclePublicKey}`)
    return buildUnsignedXdr({
      contractId: this.config.contractId,
      functionName: 'confirm',
      args: [{ type: 'u64', value: id }],
      network: this.config.network,
      rpcUrl:  this.config.rpcUrl,
      sourcePublicKey: oraclePublicKey,
    })
  }

  /**
   * Cancel before timeout. Only payer can cancel.
   */
  async cancel(id: bigint, payer: string): Promise<XDRResult> {
    console.log(`[ConditionalPaymentClient] cancel id=${id}`)
    return buildUnsignedXdr({
      contractId: this.config.contractId,
      functionName: 'cancel',
      args: [{ type: 'u64', value: id }],
      network: this.config.network,
      rpcUrl:  this.config.rpcUrl,
      sourcePublicKey: payer,
    })
  }

  /**
   * Trigger timeout refund after the timeout_ledger has passed.
   * Anyone can call — no specific auth required.
   */
  async timeoutRefund(id: bigint, caller: string): Promise<XDRResult> {
    console.log(`[ConditionalPaymentClient] timeout_refund id=${id}`)
    return buildUnsignedXdr({
      contractId: this.config.contractId,
      functionName: 'timeout_refund',
      args: [{ type: 'u64', value: id }],
      network: this.config.network,
      rpcUrl:  this.config.rpcUrl,
      sourcePublicKey: caller,
    })
  }

  /** Submit a signed XDR and wait for ledger confirmation. */
  async submit(signedXdr: string): Promise<SubmitResult> {
    const res = await submitSignedXdr(signedXdr, this.config.network, this.config.rpcUrl)
    if (!res.ok) throw new Error(`Transaction failed: ${res.error}`)
    return waitForConfirmation(res.txHash, this.config.network, this.config.rpcUrl)
  }

  /**
   * Read payment state from on-chain ledger entries.
   * Real impl: getLedgerEntries(contractDataKey(contractId, ScVal.u64(id))) → decode ConditionalPayment XDR
   */
  async get(id: bigint): Promise<PaymentRecord> {
    console.log(`[ConditionalPaymentClient] get id=${id}`)
    // WAVE CONTRIBUTION GAP — Real impl: getLedgerEntries + XDR decode
    return {
      id, payer: 'G...', payee: 'G...', oracle: 'G...',
      amountUsdc: 0, conditionId: '', timeoutLedger: 0, status: 'Pending',
    }
  }

  /** Poll every 6 s until payment leaves Pending state. */
  async waitForConfirmation(id: bigint, maxWaitMs = 600_000): Promise<PaymentRecord> {
    const start = Date.now()
    while (Date.now() - start < maxWaitMs) {
      const record = await this.get(id)
      if (record.status !== 'Pending') return record
      await new Promise(r => setTimeout(r, 6_000))
    }
    throw new Error(`ConditionalPayment ${id} did not resolve within ${maxWaitMs / 1000}s`)
  }
}
