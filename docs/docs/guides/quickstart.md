---
id: quickstart
title: Quickstart
---

# Cascade Network Quickstart

Get your first disbursement running in minutes.

## Install the SDK

```bash
npm install @cascade-network/sdk
```

## Basic usage

```typescript
import { DisburseSDK } from '@cascade-network/sdk'

const sdk = new DisburseSDK({
  sdpEndpoint: 'https://your-sdp.example.com',
  network: 'testnet',
})

// Send a single payment
const result = await sdk.disburse({
  receiverWalletId: 'GABC...',
  amountUsdc: 100,
  asset: 'USDC',
  memo: 'Aid payment',
})

console.log(result.txRef) // Stellar transaction reference
```

## Adding a KYC hook

```typescript
sdk.hooks.register({
  event: 'pre-disbursement',
  name: 'kyc-check',
  handler: async (ctx) => {
    const approved = await myKycProvider.check(ctx.receiverWalletId)
    if (!approved) throw new Error('KYC not approved')
  }
})
```

Any payment to a receiver that fails KYC will be blocked automatically.
