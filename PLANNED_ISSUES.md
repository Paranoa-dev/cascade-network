# Cascade Network — Planned Wave Issues

Extension infrastructure for the Stellar Disbursement Platform. Issues span four components: `frontend`, `sdk`, `contracts`, `docs`.

---

## New Features

**[HIGH] Analytics module — volume, success rate, latency**
Implement `sdk/src/analytics/AnalyticsModule.ts` ingesting SDP webhook payloads into time-series metrics. Expose via `DisburseSDK.getMetrics(range)`. Wire frontend `OverviewPage` to real SDK data instead of static mock values.

**[HIGH] Disbursement flow builder — real CSV parsing + conditional payment linkage**
`DisbursePage.tsx` simulates CSV parsing. Implement real parsing via `frontend/src/utils/csv.ts`, validate rows (Stellar address format, positive amount), and optionally link rows to `ConditionalPaymentClient` escrow when a `conditionId` column is present.

**[MEDIUM] Payment status tracker — live polling**
`PaymentsPage.tsx` shows a static table. Poll `sdk.status(txRef)` on a configurable interval and reflect Pending → Completed/Failed transitions without a page reload.

**[MEDIUM] Plugin manager — add/remove hooks from UI**
`PluginsPage.tsx` "+ Add Plugin" button is a no-op. Implement a modal that calls `sdk.hooks.register()` with name, event type, and a webhook endpoint URL.

---

## Stub Implementations

**[HIGH] M-Pesa rails adapter (Daraja B2C)**
`MpesaAdapter` in `sdk/src/rails/StellarRailsAdapter.ts` is marked `WAVE CONTRIBUTION GAP`. Implement `disburse()` (OAuth → B2C paymentrequest → return ConversationID) and `status()`. Include unit tests with mocked HTTP.

**[HIGH] Bank transfer rails adapter**
Add `BankTransferAdapter` implementing `RailsAdapter` targeting a configurable REST endpoint. Second reference implementation alongside M-Pesa.

**[MEDIUM] `ConditionalPaymentClient.get()` — on-chain ledger read**
Currently returns a placeholder. Implement using `SorobanRpc.getLedgerEntries()` + XDR decode to return a real `PaymentRecord`. Required for `waitForConfirmation()` to work end-to-end.

**[MEDIUM] Implement `buildUnsignedXdr` and `submitSignedXdr`**
Both functions in `sdk/src/stellar.ts` are stubs. Implement using `@stellar/stellar-sdk`: `TransactionBuilder` → `simulateTransaction` → `assembleTransaction` for XDR building; `sendTransaction` + polling `getTransaction` for submission.

---

## Testing

**[HIGH] SDK integration tests — hooks, rails, retry queue**
No tests exist in `sdk/src/`. Write Jest tests covering: ordered hook execution, pre-disbursement abort, `RetryQueue` backoff with a mock that fails N times then succeeds, and `disburseBatchWithRetry` with partial failures.

**[MEDIUM] Contract test — timeout refund path**
`conditional_payment` has no timeout test. Advance `env.ledger().set_sequence_number()` past `timeout_ledger` and assert `timeout_refund` succeeds and `confirm` fails.

**[MEDIUM] Contract test — two-of-two escrow approval**
Escrow supports configurable `required_approvals` but only a single-approval test exists. Add a test asserting escrow stays `Pending` after one approval and releases only after the second.

**[TRIVIAL] Frontend smoke tests — Vitest + React Testing Library**
`"test": "echo No tests configured yet"`. Set up Vitest + RTL and add mount tests for all four pages.

---

## Documentation

**[HIGH] Deployment playbook — self-hosting with SDP**
`docs/docs/guides/self-hosting.md` is a stub. Write a full guide: prerequisites, `.env` config for each component, deploying contracts to testnet, running the SDK server, serving the portal.

**[MEDIUM] Hook authoring guide**
Tutorial: implement a KYC pre-disbursement hook, test it with the SDK stub adapter, register via `sdk.hooks.register()`, toggle in the portal.

**[MEDIUM] Custom rails adapter guide**
Use `MpesaAdapter` as a worked example: implement `RailsAdapter`, handle token refresh, map statuses to `StatusResult`, register with `sdk.useRails()`.

**[TRIVIAL] SDK API reference via TypeDoc**
Add `typedoc` to `sdk/package.json`, generate HTML into `docs/docs/api/`, wire into the Docusaurus sidebar.

---

## Repo Health

**[TRIVIAL] Deploy contracts to testnet, publish contract IDs**
Run `stellar contract deploy` for both contracts. Update `.env.example` files and `docs/docs/intro.md` with live testnet contract IDs.

**[TRIVIAL] Publish SDK to npm as `@cascade-network/sdk`**
Add `sdk-publish.yml` workflow triggered on `v*` tags: `npm run build` → `npm publish --access public` using `NPM_TOKEN` secret.
