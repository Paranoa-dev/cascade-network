/**
 * CascadeRailsAdapter — default Rails adapter routing disbursements through
 * the Stellar Disbursement Platform (SDP) REST API.
 *
 * Integrators can replace this with any alternative adapter (M-Pesa, bank wire, Airtel)
 * by implementing the RailsAdapter interface and calling sdk.useRails(new MyAdapter()).
 */
import { DisburseParams, DisburseResult, RailsAdapter, StatusResult } from './types'

export class CascadeRailsAdapter implements RailsAdapter {
  name = 'stellar-sdp'
  private sdpEndpoint: string
  private authToken?: string

  constructor(sdpEndpoint: string, authToken?: string) {
    this.sdpEndpoint = sdpEndpoint.replace(/\/$/, '')
    this.authToken   = authToken
  }

  private get headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    if (this.authToken) h['Authorization'] = `Bearer ${this.authToken}`
    return h
  }

  /**
   * Execute a disbursement via the SDP /payments endpoint.
   * The SDP returns a transaction status — we map it to our DisburseResult.
   *
   * SDP docs: POST /payments
   *   body: { receiver_id, amount, asset_code, asset_issuer, memo }
   *   returns: { id, status, stellar_transaction_id }
   */
  async disburse(params: DisburseParams): Promise<DisburseResult> {
    console.log(
      `[CascadeRailsAdapter] disburse — receiver=${params.receiverWalletId} ` +
      `amount=${params.amountUsdc} ${params.asset}`
    )

    try {
      const res = await fetch(`${this.sdpEndpoint}/payments`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          receiver_id:  params.receiverWalletId,
          amount:       params.amountUsdc.toFixed(7),
          asset_code:   params.asset,
          asset_issuer: '',  // filled by SDP config
          memo:         params.memo ?? '',
          external_id:  params.conditionId ?? `cascade-${Date.now()}`,
        }),
      })

      if (!res.ok) {
        const errBody = await res.text()
        console.error(`[CascadeRailsAdapter] SDP error ${res.status}: ${errBody}`)
        return { success: false, txRef: '', errorMessage: `SDP ${res.status}: ${errBody}` }
      }

      const data = (await res.json()) as { id?: string; status?: string }
      const txRef = data.id ?? `sdp-${Date.now()}`
      console.log(`[CascadeRailsAdapter] payment queued txRef=${txRef}`)
      return { success: true, txRef }

    } catch (err: any) {
      console.error('[CascadeRailsAdapter] network error:', err.message)
      return { success: false, txRef: '', errorMessage: err.message }
    }
  }

  /**
   * Query SDP payment status.
   * GET /payments/:id → { status: 'SUCCESS' | 'PENDING' | 'FAILED', completed_at }
   */
  async status(txRef: string): Promise<StatusResult> {
    try {
      const res = await fetch(`${this.sdpEndpoint}/payments/${txRef}`, {
        headers: this.headers,
      })

      if (!res.ok) return { status: 'failed', txRef }

      const data = (await res.json()) as { status?: string; completed_at?: string }

      const statusMap: Record<string, StatusResult['status']> = {
        SUCCESS: 'completed',
        PENDING: 'pending',
        FAILED:  'failed',
      }

      return {
        status: statusMap[data.status ?? 'PENDING'] ?? 'pending',
        txRef,
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      }
    } catch {
      return { status: 'pending', txRef }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// M-Pesa Example Adapter
// Copy this class as a starting point for custom rails integrations.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * MpesaAdapter — example implementation of RailsAdapter for M-Pesa B2C.
 *
 * To use: sdk.useRails(new MpesaAdapter({ consumerKey: '...', consumerSecret: '...', shortCode: '...' }))
 *
 * WAVE CONTRIBUTION GAP — implement disburse() and status() using the M-Pesa Daraja API.
 * Docs: https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate
 */
export class MpesaAdapter implements RailsAdapter {
  name = 'mpesa'

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(private _config: { consumerKey: string; consumerSecret: string; shortCode: string }) {}

  async disburse(params: DisburseParams): Promise<DisburseResult> {
    // WAVE CONTRIBUTION GAP: implement M-Pesa B2C transfer using Daraja API
    // 1. Get OAuth token: POST https://sandbox.safaricom.co.ke/oauth/v1/generate
    // 2. B2C payment: POST https://sandbox.safaricom.co.ke/mpesa/b2c/v3/paymentrequest
    //    body: { InitiatorName, SecurityCredential, CommandID: 'BusinessPayment',
    //            Amount: params.amountUsdc * KES_RATE, PartyA: shortCode, PartyB: params.receiverWalletId }
    // 3. Return ConversationID as txRef
    console.log(`[MpesaAdapter] WAVE CONTRIBUTION GAP — disburse ${params.amountUsdc} USDC to ${params.receiverWalletId}`)
    return { success: false, txRef: '', errorMessage: 'MpesaAdapter not yet implemented — see Wave issues' }
  }

  async status(txRef: string): Promise<StatusResult> {
    // WAVE CONTRIBUTION GAP: query transaction result via Daraja API
    console.log(`[MpesaAdapter] WAVE CONTRIBUTION GAP — status ${txRef}`)
    return { status: 'pending', txRef }
  }
}
