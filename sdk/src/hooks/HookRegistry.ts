import { Hook, HookContext, HookEvent } from './types'

export class HookRegistry {
  private hooks: Map<HookEvent, Hook[]> = new Map()

  /**
   * Register a hook for a lifecycle event.
   *
   * @example
   * registry.register({
   *   event: 'pre-disbursement',
   *   name: 'kyc-check',
   *   handler: async (ctx) => {
   *     const ok = await kycProvider.check(ctx.receiverWalletId)
   *     if (!ok) throw new Error('KYC not approved')
   *   }
   * })
   */
  register(hook: Hook): void {
    const existing = this.hooks.get(hook.event) ?? []
    existing.push(hook)
    // Sort by order ascending (lower runs first)
    existing.sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
    this.hooks.set(hook.event, existing)
    console.log(`[HookRegistry] registered '${hook.name}' on ${hook.event}`)
  }

  /**
   * Unregister a hook by name and event.
   */
  unregister(event: HookEvent, name: string): void {
    const existing = this.hooks.get(event) ?? []
    this.hooks.set(event, existing.filter(h => h.name !== name))
  }

  /**
   * Run all hooks for an event in order.
   * If any hook throws, execution stops and the error propagates.
   */
  async run(event: HookEvent, ctx: Omit<HookContext, 'event'>): Promise<void> {
    const hooks = this.hooks.get(event) ?? []
    const fullCtx: HookContext = { ...ctx, event }

    for (const hook of hooks) {
      try {
        await hook.handler(fullCtx)
      } catch (err) {
        console.error(`[HookRegistry] hook '${hook.name}' failed on ${event}:`, err)
        throw err
      }
    }
  }

  /**
   * List all registered hooks.
   */
  list(): Array<{ event: HookEvent; name: string; order: number }> {
    const result: Array<{ event: HookEvent; name: string; order: number }> = []
    for (const [event, hooks] of this.hooks) {
      for (const h of hooks) {
        result.push({ event, name: h.name, order: h.order ?? 100 })
      }
    }
    return result
  }
}
