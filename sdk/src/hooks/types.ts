export type HookEvent =
  | 'pre-disbursement'
  | 'post-disbursement'
  | 'on-failure'
  | 'pre-condition-check'

export interface HookContext {
  event: HookEvent
  receiverWalletId: string
  amountUsdc: number
  asset: string
  conditionId?: string
  metadata?: Record<string, unknown>
}

export type HookFn = (ctx: HookContext) => Promise<void>

export interface Hook {
  event: HookEvent
  name: string
  handler: HookFn
  order?: number  // lower runs first, default 100
}
