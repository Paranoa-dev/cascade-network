---
id: sdk-reference
title: SDK Reference
---

# SDK Reference

## DisburseSDK

### Constructor

```typescript
new DisburseSDK(config: DisburseSDKConfig)
```

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `sdpEndpoint` | string | ✅ | URL of your SDP instance |
| `rpcUrl` | string | | Stellar RPC URL (defaults to sdpEndpoint) |
| `network` | `'mainnet' \| 'testnet'` | | Network (default: testnet) |
| `conditionalPaymentContractId` | string | | Deployed contract ID |

### Methods

#### `disburse(params)`
Send a single payment through all hooks and configured rails.

#### `disburseBatch(payments)`
Send multiple payments concurrently. Returns per-payment results.

#### `useRails(adapter)`
Replace the default Stellar rails with a custom adapter.

#### `status(txRef)`
Query the status of a prior disbursement.

## HookRegistry

#### `hooks.register(hook)`
Register a lifecycle hook.

#### `hooks.unregister(event, name)`
Remove a hook by name and event.

#### `hooks.list()`
List all registered hooks.
