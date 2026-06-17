---
id: self-hosting
title: Self-Hosting Deployment Playbook
sidebar_label: Self-Hosting
---

# Self-Hosting Cascade Network + SDP

This playbook covers deploying Cascade Network alongside the Stellar Disbursement Platform (SDP) for NGO, government, or fintech operators.

## Prerequisites

- Docker 24+ and Docker Compose v2
- A Stellar account with at least 10 XLM for transaction fees
- A running SDP instance (see [SDP setup docs](https://developers.stellar.org/docs/stellar-disbursement-platform))
- (Optional) A testnet account for staging: `stellar keys generate --global operator --network testnet`

## Architecture

```
[operator]
    │
    ▼
[cascade-network-portal]  ← React operator UI (port 3000)
    │
    ▼
[cascade-network-sdk]     ← TypeScript SDK server (port 4001)
    │         │
    ▼         ▼
[Stellar SDP]   [conditional_payment contract]
    │
    ▼
[Stellar testnet / mainnet]
```

## Docker Compose setup

```yaml
version: '3.8'
services:
  cascade-portal:
    image: ghcr.io/cascade-network/cascade-portal:latest
    ports:
      - "3000:3000"
    environment:
      - VITE_SDK_URL=http://cascade-sdk:4001
      - VITE_NETWORK=testnet
    depends_on:
      - cascade-sdk

  cascade-sdk:
    image: ghcr.io/cascade-network/cascade-sdk:latest
    ports:
      - "4001:4001"
    environment:
      - SDP_ENDPOINT=${SDP_ENDPOINT}
      - SDP_AUTH_TOKEN=${SDP_AUTH_TOKEN}
      - STELLAR_NETWORK=testnet
      - STELLAR_RPC_URL=https://soroban-testnet.stellar.org
      - CONDITIONAL_PAYMENT_CONTRACT_ID=${CONDITIONAL_PAYMENT_CONTRACT_ID}
      - PORT=4001
```

## Environment variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SDP_ENDPOINT` | Your SDP base URL | `https://sdp.myorg.com` |
| `SDP_AUTH_TOKEN` | SDP API bearer token | `eyJ...` |
| `STELLAR_NETWORK` | `testnet` or `mainnet` | `testnet` |
| `STELLAR_RPC_URL` | Stellar RPC endpoint | `https://soroban-testnet.stellar.org` |
| `CONDITIONAL_PAYMENT_CONTRACT_ID` | Deployed contract | `CXXX...` |

## Deploying contracts

```bash
# 1. Build the WASM
cd cascade-network-contracts
stellar contract build

# 2. Deploy to testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/conditional_payment.wasm \
  --source operator \
  --network testnet

# Outputs: CXXX...YOUR_CONTRACT_ID
# Save this as CONDITIONAL_PAYMENT_CONTRACT_ID in your .env
```

## Health check

```bash
curl http://localhost:4001/health
# → { "status": "ok", "network": "testnet", "sdp": "connected" }
```

## Adding a custom compliance hook

See the [hook authoring guide](./hook-authoring.md) for KYC/sanctions examples.
