# Cascade Network — Wave Program Issues

---

## contracts

### [HIGH] Implement conditional_payment contract
Release held funds when an authorised oracle address calls `confirm(condition_id)`.
Supports: deposit, confirm, timeout_refund, cancel.
**Complexity:** High | **Points:** 200

### [HIGH] Implement multi-party escrow contract
Holds funds with configurable release conditions: unanimous approval, majority,
or single designated arbiter. Supports dispute resolution flow.
**Complexity:** High | **Points:** 200

### [MEDIUM] Write test suite for conditional_payment — timeout and confirm paths
Cover: deposit → confirm (happy path), deposit → timeout (refund path),
unauthorised confirm reverts.
**Complexity:** Medium | **Points:** 150

### [MEDIUM] Add Sentinel scan to CI pipeline
Cross-project integration: run sentinel-onchain-engine on contracts in CI.
**Complexity:** Medium | **Points:** 150

### [TRIVIAL] Deploy contracts to testnet and publish IDs
stellar contract deploy on testnet; update .env.example and docs.
**Complexity:** Trivial | **Points:** 100

---

## sdk

### [HIGH] Implement hook plugin system (pre-disbursement, post-disbursement, on-failure)
Plugin registry with async hook execution, error handling, and hook ordering.
**Complexity:** High | **Points:** 200

### [HIGH] Implement custom payment rails adapter interface
Abstract interface allowing teams to plug in alternative rails (mobile money,
bank transfer, Moneygram) alongside Stellar native payments.
**Complexity:** High | **Points:** 200

### [HIGH] Implement analytics module — disbursement volume, success rate, latency
Aggregates SDP webhook data into time-series metrics exposed via SDK methods.
**Complexity:** High | **Points:** 200

### [MEDIUM] Build example KYC hook plugin (stub + integration test)
Reference implementation of a `pre-disbursement` hook calling a mock KYC API.
**Complexity:** Medium | **Points:** 150

### [MEDIUM] Build example mobile money rails adapter (stub)
Shows how to implement the rails adapter interface for a hypothetical M-Pesa
or Airtel Money integration.
**Complexity:** Medium | **Points:** 150

### [TRIVIAL] Publish SDK to npm as @cascade-network/sdk
GitHub Actions publish workflow triggered on version tag push.
**Complexity:** Trivial | **Points:** 100

---

## frontend

### [HIGH] Disbursement flow builder — configure receivers, amounts, conditions
Form-based UI to set up a disbursement batch: CSV upload of receivers,
per-receiver amounts, optional conditional payment contract linkage.
**Complexity:** High | **Points:** 200

### [HIGH] Analytics dashboard — volume, success rate, failure breakdown charts
Recharts-based dashboard consuming the SDK analytics module.
**Complexity:** High | **Points:** 200

### [MEDIUM] Plugin manager — install, configure, and toggle compliance hooks
UI for registering and ordering hook plugins without code changes.
**Complexity:** Medium | **Points:** 150

### [MEDIUM] Payment status tracker — real-time status per receiver
Table view with SDP payment status (pending / completed / failed) updating
via polling or webhook.
**Complexity:** Medium | **Points:** 150

### [TRIVIAL] Export disbursement report as CSV / PDF
Download button on all completed disbursement batches.
**Complexity:** Trivial | **Points:** 100

---

## docs

### [HIGH] Write deployment playbook — self-hosting Cascade Network with SDP
Step-by-step guide for NGOs and government teams deploying the full stack.
**Complexity:** High | **Points:** 200

### [MEDIUM] Write hook authoring guide — building a custom compliance plugin
Tutorial walking through writing, testing, and registering a custom hook.
**Complexity:** Medium | **Points:** 150

### [MEDIUM] Write custom rails adapter guide
How to implement the rails adapter interface for a non-Stellar payment method.
**Complexity:** Medium | **Points:** 150

### [TRIVIAL] Write API reference for the SDK public interface
Auto-generated TypeDoc output formatted and published to the docs site.
**Complexity:** Trivial | **Points:** 100

### [TRIVIAL] Translate deployment playbook to French
Priority for Francophone Africa humanitarian use cases.
**Complexity:** Trivial | **Points:** 100

---

## Additional improvement issues (repo health)

Use the `Stellar Wave` label and pick a complexity label when filing on GitHub.

### [TRIVIAL] Adopt npm workspaces **or** document `file:` SDK linking for standalone clones
Portals used `workspace:*`, which fails outside a monorepo; `file:../sdk` works for this layout—encode the chosen approach in each repo README.
**Complexity:** Trivial | **Points:** 100

### [TRIVIAL] Align Docusaurus navbar home links to remove `/` broken-link warnings
Same pattern as other org docs sites after `npm run build`.
**Complexity:** Trivial | **Points:** 100

### [MEDIUM] Tighten `unknown` JSON typing across SDK adapters beyond the initial casts
Prefer shared response types or runtime validation (e.g. zod) for SDP/RPC payloads.
**Complexity:** Medium | **Points:** 150
