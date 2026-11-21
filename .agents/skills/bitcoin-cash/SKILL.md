---
name: bitcoin-cash
description: Bitcoin Cash (BCH) smart contract, CashTokens, and dApp integration reference. Use when writing or reviewing CashScript (.cash) contracts, designing UTXO/covenant/CashTokens systems, building transactions with CashScript TypeScript SDK or Libauth, integrating WizardConnect or BCH WalletConnect, or debugging/testing/deploying on Chipnet or Mainnet.
---

# Bitcoin Cash (BCH) & CashScript Reference

BCH uses the **UTXO model**, not EVM accounts/global storage. Fetch the relevant primary docs below before designing contracts or writing transaction code.

## 1. Fundamentals & CashScript Language

- What is CashScript: https://cashscript.org/docs/basics/about
- Intro to BCH & UTXO Script: https://cashscript.org/docs/basics/about-bch
- Getting Started: https://cashscript.org/docs/basics/getting-started
- Contract Structure: https://cashscript.org/docs/language/contracts
- Types & Operators: https://cashscript.org/docs/language/types
- Global Functions: https://cashscript.org/docs/language/functions
- Global Variables (timelocks, introspection): https://cashscript.org/docs/language/globals
- Language Examples: https://cashscript.org/docs/language/examples

## 2. Smart Contract Design (UTXO, Covenants, CashTokens)

- Covenants & Native Introspection: https://cashscript.org/docs/design/covenants
- CashTokens in CashScript: https://cashscript.org/docs/design/cashtokens
- Modular Contract Design (multi-UTXO covenants): https://cashscript.org/docs/design/modular
- Contract Concurrency (avoiding UTXO contention): https://cashscript.org/docs/design/concurrency
- Optimizing Contracts (opcount & bytesize): https://cashscript.org/docs/design/optimization
- CashTokens CHIP Spec: https://cashtokens.org/docs/spec/chip/
- BCMR (Token Metadata Registry) CHIP: https://cashtokens.org/docs/bcmr/chip/

## 3. Compiler, Limits & TypeScript SDK

- `cashc` Compiler (`.json` / `--format ts` artifacts): https://cashscript.org/docs/compiler/
- Script & Transaction Limits (10 KB P2SH, 201 B P2S, ops): https://cashscript.org/docs/compiler/script-limits
- Artifact Format: https://cashscript.org/docs/compiler/artifacts
- TypeScript SDK Overview: https://cashscript.org/docs/sdk/typescript-sdk
- Contract Instantiation (`p2sh32` vs `p2sh20` vs `p2s`): https://cashscript.org/docs/sdk/instantiation
- Transaction Builder (`TransactionBuilder`): https://cashscript.org/docs/sdk/transaction-builder
- Transaction Utilities: https://cashscript.org/docs/sdk/transaction-utilities
- Network Providers (`ElectrumNetworkProvider`, `MockNetworkProvider`): https://cashscript.org/docs/sdk/network-provider
- Signature Templates: https://cashscript.org/docs/sdk/signature-templates
- SDK Examples (HodlVault, PriceOracle): https://cashscript.org/docs/sdk/examples

## 4. Wallet & dApp Integration

- CashScript WalletConnect & WizardConnect Guide: https://cashscript.org/docs/guides/walletconnect
- WizardConnect Docs (`@wizardconnect/core`, `@wizardconnect/dapp`, `@wizardconnect/react`): https://docs.riftenlabs.com/wizardconnect/
- WizardConnect Dapp Integration: https://docs.riftenlabs.com/wizardconnect/dapp/
- WizardConnect React Hooks & QR Modal: https://docs.riftenlabs.com/wizardconnect/react/
- WizardConnect Extensions: https://docs.riftenlabs.com/wizardconnect/extensions/
- Compatible Wallets: Cashonize (https://github.com/cashonize/cashonize-wallet), Paytaca (https://github.com/paytaca/paytaca-app)

## 5. Testing, Debugging, Deployment & Security

- Testing Setup (`MockNetworkProvider` / virtual UTXOs): https://cashscript.org/docs/sdk/testing-setup
- Debugging (`.debug()`, `console.log`, Bitauth IDE URI): https://cashscript.org/docs/guides/debugging
- Contract Deployment (stateless vs stateful token genesis): https://cashscript.org/docs/guides/deployment
- Contract Infrastructure (metadata storage, tx servers): https://cashscript.org/docs/guides/infrastructure
- Transaction Lifecycle (0-conf, mempool, unconfirmed chains): https://cashscript.org/docs/guides/lifecycle
- Adversarial Analysis (MEV, double-spends, covenant attacks): https://cashscript.org/docs/guides/adversarial

## 6. XO Stack & XO Templates (General Protocols)

- XO Stack Docs: https://stack.xo.cash/ | Getting Started: https://stack.xo.cash/getting-started.html
- XO Stack API Reference: https://stack.xo.cash/api/ | Types: https://stack.xo.cash/api/@xo-cash/types.html
- Writing XO Templates Guide: https://stack.xo.cash/blog/2026-08-24-Vision-to-Reality-6-Writing-Templates
- XO Repositories (`@xo-cash` `0.1.0-next.xxx` on npm): https://gitlab.com/GeneralProtocols/xo
- XO Template Interface: https://gitlab.com/GeneralProtocols/xo/types/-/blob/development/source/template.ts
- XO Debug Tool (inspect invitations): https://blaze.xo.cash/

## 7. Low-Level Libraries, Indexers & Tooling

- Libauth (zero-dependency keys, VM, encoding): https://libauth.org/
- Bitauth IDE (script/stack debugger): https://ide.bitauth.com/
- CashScript Playground: https://playground.cashscript.org/
- Ecosystem Directory (Chaingraph, Fulcrum, Oracles): https://developers.cash/
- Chipnet Faucets (free tBCH): https://tbch.googol.cash/ | https://chipnet.bch.ninja/ | https://faucet.paytaca.com/
- BCH BLAZE 2026 Hackathon Portal: https://bchblaze.cash/

## Critical Invariants (Do Not Violate)

- **Dust limit:** Plain P2PKH outputs require `>= 546` satoshis; outputs carrying CashTokens or covenants require `>= ~800–1600` satoshis (safe default: `1000` sats).
- **WizardConnect vs WalletConnect:** CashScript `generateWcTransactionObject()` covers both; WizardConnect additionally requires `inputPaths: [inputIndex, pathName, addressIndex][]` matching final input order, and does not provide generic message signing.
- **Address types:** Use CashTokens-aware addresses (`bitcoincash:z...`) whenever outputs can hold tokens; `p2sh32` is CashScript's secure default (confirm target wallet support if mixing `p2sh20`/`p2sh32`/`p2s`).
- **Safe workflow:** Develop and test against `MockNetworkProvider` (or `libauth` VM vectors for XO) → verify on `chipnet` (free faucet) → switch provider to `mainnet` only after contract invariants and fee math are verified.
