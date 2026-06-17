/**
 * RailsAdapter — interface for plugging in alternative payment rails.
 *
 * Implement this interface to route disbursements through mobile money,
 * bank transfer, or any other payment method instead of native Stellar payments.
 *
 * @example
 * class MpesaAdapter implements RailsAdapter {
 *   name = 'mpesa'
 *   async disburse(params) {
 *     const result = await mpesaApi.send({ to: params.receiverPhone, amount: params.amountKes })
 *     return { success: result.ok, txRef: result.transactionId }
 *   }
 *   async status(txRef) {
 *     const s = await mpesaApi.query(txRef)
 *     return { status: s.resultCode === '0' ? 'completed' : 'pending', txRef }
 *   }
 * }
 */
export interface DisburseParams {
  receiverWalletId: string
  amountUsdc: number
  asset: string
  memo?: string
  conditionId?: string
}

export interface DisburseResult {
  success: boolean
  txRef: string
  errorMessage?: string
}

export interface StatusResult {
  status: 'pending' | 'completed' | 'failed'
  txRef: string
  completedAt?: Date
}

export interface RailsAdapter {
  /** Unique name for this adapter, used in logging and config */
  name: string

  /** Execute a disbursement via this rails provider */
  disburse(params: DisburseParams): Promise<DisburseResult>

  /** Query the status of a prior disbursement */
  status(txRef: string): Promise<StatusResult>
}
