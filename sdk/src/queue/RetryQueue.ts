/**
 * RetryQueue — processes failed disbursements with exponential backoff.
 *
 * Retries up to maxAttempts (default 5) times. Delay starts at baseDelayMs
 * and doubles on each attempt, capped at maxDelayMs.
 * Sequence number errors are detected and logged explicitly per the
 * SD-H01 acceptance criterion.
 */

export interface RetryItem<T> {
  id: string
  payload: T
  attempt: number
  lastError?: string
}

export interface RetryQueueOptions {
  maxAttempts?: number
  baseDelayMs?: number
  maxDelayMs?: number
}

export type RetryHandler<T, R> = (item: T, attempt: number) => Promise<R>

const SEQUENCE_ERR_PATTERNS = ['tx_bad_seq', 'sequence', 'SEQUENCE']

function isSequenceError(msg: string): boolean {
  return SEQUENCE_ERR_PATTERNS.some(p => msg.includes(p))
}

function backoffMs(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
  return Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs)
}

export class RetryQueue<T, R> {
  private queue: RetryItem<T>[] = []
  private readonly maxAttempts: number
  private readonly baseDelayMs: number
  private readonly maxDelayMs: number

  constructor(options: RetryQueueOptions = {}) {
    this.maxAttempts = options.maxAttempts ?? 5
    this.baseDelayMs = options.baseDelayMs ?? 1_000
    this.maxDelayMs  = options.maxDelayMs  ?? 30_000
  }

  /** Enqueue an item for (re)processing. */
  enqueue(id: string, payload: T, attempt = 1): void {
    this.queue.push({ id, payload, attempt })
  }

  /** Number of items waiting in the queue. */
  get size(): number {
    return this.queue.length
  }

  /**
   * Process the entire queue, calling handler() for each item.
   * Failed items are re-enqueued with attempt+1 until maxAttempts is reached.
   *
   * @returns Array of successful results.
   */
  async drain(handler: RetryHandler<T, R>): Promise<R[]> {
    const successes: R[] = []

    while (this.queue.length > 0) {
      const item = this.queue.shift()!

      try {
        const result = await handler(item.payload, item.attempt)
        console.log(`[RetryQueue] ${item.id} succeeded on attempt ${item.attempt}`)
        successes.push(result)
      } catch (err: any) {
        const msg: string = err?.message ?? String(err)
        if (isSequenceError(msg)) {
          console.error(`[RetryQueue] ${item.id} attempt ${item.attempt} — sequence number error: ${msg}`)
        } else {
          console.warn(`[RetryQueue] ${item.id} attempt ${item.attempt} failed: ${msg}`)
        }

        if (item.attempt >= this.maxAttempts) {
          console.error(`[RetryQueue] ${item.id} exhausted ${this.maxAttempts} attempts — giving up`)
          continue
        }

        const delay = backoffMs(item.attempt, this.baseDelayMs, this.maxDelayMs)
        console.log(`[RetryQueue] ${item.id} retrying in ${delay}ms (attempt ${item.attempt + 1}/${this.maxAttempts})`)
        await new Promise(r => setTimeout(r, delay))
        this.enqueue(item.id, item.payload, item.attempt + 1)
      }
    }

    return successes
  }
}
