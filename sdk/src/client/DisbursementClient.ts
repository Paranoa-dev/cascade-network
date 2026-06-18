/**
 * DisbursementClient — thin client over DisburseSDK that adds resilient
 * batch retry for failed payments using exponential backoff via RetryQueue.
 *
 * Usage:
 *   const client = new DisbursementClient(sdk)
 *   const results = await client.disburseBatchWithRetry(payments)
 */
import { DisburseSDK, DisburseParams, BatchResult } from '../DisburseSDK'
import { RetryQueue, RetryQueueOptions } from '../queue/RetryQueue'

export interface DisbursementClientOptions extends RetryQueueOptions {}

export class DisbursementClient {
  private sdk: DisburseSDK
  private retryOptions: RetryQueueOptions

  constructor(sdk: DisburseSDK, options: DisbursementClientOptions = {}) {
    this.sdk = sdk
    this.retryOptions = {
      maxAttempts: options.maxAttempts ?? 5,
      baseDelayMs: options.baseDelayMs ?? 1_000,
      maxDelayMs:  options.maxDelayMs  ?? 30_000,
    }
  }

  /**
   * Execute a batch of disbursements, automatically retrying any that fail
   * up to maxAttempts times with exponential backoff.
   *
   * Sequence number errors are logged explicitly on each attempt.
   *
   * @returns All results, including any that ultimately failed after exhausting retries.
   */
  async disburseBatchWithRetry(payments: DisburseParams[]): Promise<BatchResult[]> {
    console.log(`[DisbursementClient] starting batch of ${payments.length} payments`)

    // First pass — attempt all payments
    const firstPass = await this.sdk.disburseBatch(payments)
    const successes = firstPass.filter(r => r.success)
    const failures  = firstPass.filter(r => !r.success)

    if (failures.length === 0) {
      console.log(`[DisbursementClient] all ${payments.length} payments succeeded on first attempt`)
      return firstPass
    }

    console.log(`[DisbursementClient] ${failures.length} failed, queuing for retry`)

    // Build a RetryQueue for the failed subset
    const queue = new RetryQueue<DisburseParams, BatchResult>(this.retryOptions)
    for (const failure of failures) {
      queue.enqueue(failure.receiverWalletId, payments[failure.index])
    }

    const retried = await queue.drain(async (params, attempt) => {
      console.log(`[DisbursementClient] retry attempt ${attempt} for ${params.receiverWalletId}`)
      const result = await this.sdk.disburse(params)
      if (!result.success) {
        throw new Error(result.errorMessage ?? 'disbursement failed')
      }
      return {
        ...result,
        receiverWalletId: params.receiverWalletId,
        index: payments.findIndex(p => p.receiverWalletId === params.receiverWalletId),
      } satisfies BatchResult
    })

    const allResults = [...successes, ...retried]
    console.log(
      `[DisbursementClient] batch complete — ` +
      `${allResults.filter(r => r.success).length}/${payments.length} succeeded`
    )
    return allResults
  }

  /** Delegate single disbursements straight through to the SDK. */
  async disburse(params: DisburseParams) {
    return this.sdk.disburse(params)
  }
}
