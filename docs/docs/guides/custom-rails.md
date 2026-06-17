---
id: custom-rails
title: Custom Payment Rails
---

# Custom Payment Rails

Replace Stellar native payments with any other rails (M-Pesa, Airtel, bank transfer).

## Implement RailsAdapter

```typescript
import { RailsAdapter, DisburseParams, DisburseResult, StatusResult } from '@cascade-network/sdk'

class MpesaAdapter implements RailsAdapter {
  name = 'mpesa'

  async disburse(params: DisburseParams): Promise<DisburseResult> {
    const res = await mpesaApi.b2c({
      phoneNumber: params.receiverWalletId,
      amount: params.amountUsdc * 130, // KES conversion
    })
    return { success: res.ok, txRef: res.ConversationID }
  }

  async status(txRef: string): Promise<StatusResult> {
    const s = await mpesaApi.query(txRef)
    return {
      status: s.ResultCode === '0' ? 'completed' : 'pending',
      txRef,
    }
  }
}
```

## Register the adapter

```typescript
sdk.useRails(new MpesaAdapter())
// All subsequent sdk.disburse() calls go through M-Pesa
```
