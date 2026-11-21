# Bitcoin Cash (BCH) Technical Primer & Architecture Knowledge

Distilled reference from CashScript, CashTokens CHIP, WizardConnect (Riften Labs), and Libauth documentation. For primary links, see [`.agents/skills/bitcoin-cash/SKILL.md`](../../.agents/skills/bitcoin-cash/SKILL.md).

---

## 1. Mental Model: UTXO vs EVM (Ethereum)

| Concept | Ethereum (EVM) | Bitcoin Cash (UTXO + CashScript) |
| :--- | :--- | :--- |
| **State model** | Global mutable account storage | Immutable **UTXOs**; spending consumes old UTXOs and creates new ones |
| **Contract deployment** | On-chain bytecode deploy transaction (costs gas) | **Local compilation** (`cashc`) → deterministic script address. Stateless contracts need **no deploy tx**; ready once funded. Stateful contracts only need a **CashTokens genesis tx** |
| **Execution** | Nodes run arbitrary loops/state writes | Pure validation predicate: contract script returns `true`/`false` given unlocking args + tx introspection |
| **Token standard** | ERC-20 / ERC-721 inside contract mappings | **CashTokens** are native consensus-level fields on UTXOs (FT amount + 1 NFT with `none`/`mutable`/`minting` capability + `0..40B` commitment) |
| **Failed tx fee** | Reverted tx still consumes gas | Invalid tx is **rejected by mempool/nodes**; **0 fee paid** |
| **Fee pricing** | Dynamic gas auction (`gwei`) | Flat `~1 sat/byte` (`minrelaytxfee`); 32 MB+ blocks (ABLA) avoid congestion spikes |

---

## 2. Smart Contracts with CashScript

- **Language & Compiler (`cashc`):**
  - Solidity-like syntax compiled to BCH Script (`cashc contract.cash --format ts -o artifact.ts` gives full TypeScript types for constructor and unlocker args).
  - Enforces function parameter byte lengths (`bytes20`, `bytes32`, `bool`) by default.
- **Address / Contract Types (`Contract` constructor `contractType`):**
  - `p2sh32` (**default & recommended**): 32-byte script hash, resists collision attacks for contracts holding value (note: verify target wallet support).
  - `p2sh20`: 20-byte legacy P2SH hash (avoid for high-value vaults due to birthday-attack risk).
  - `p2s`: Pay-to-Script (script unhashed on-chain, max **201 bytes**; useful for public visibility/introspection).
- **Script & Transaction Limits:**
  - Max P2SH contract bytecode: **10,000 bytes** (`contract.bytesize` reports exact size including constructor args).
  - Max P2S locking script: **201 bytes**.
  - Max stack element size: **520 bytes** (older pre-upgrade; check `script-limits` for current May 2025/2026 VM limit upgrades).
  - **Dust limits:** Plain P2PKH output `>= 546 satoshis`; UTXO carrying CashTokens or complex covenant scripts requires `>= ~800–1,596 satoshis` (standard safe covenant/token output floor: **1,000 sats**).
- **Covenants & Native Introspection:**
  - Contracts inspect the spending transaction directly via `tx.inputs[i]` and `tx.outputs[i]` (`value`, `lockingBytecode`, `tokenCategory`, `tokenAmount`, `nftCapability`, `nftCommitment`, `activeInputIndex`).
  - **Local State:** Store mutable state inside an **NFT `commitment` (0–40 bytes)** held at the same contract address (covenant enforces `tx.outputs[i].lockingBytecode == tx.inputs[this.activeInputIndex].lockingBytecode` and valid state transition).
  - **Modular Design & Concurrency:** Avoid single-UTXO global bottlenecks (where two concurrent users conflict on the same UTXO). Prefer **per-user / per-order UTXOs**, **sharded pools**, or **chained unconfirmed transactions** where appropriate; verify zero-conf / double-spend incentives via adversarial analysis.

---

## 3. CashTokens & BCMR

- **Token Output Model (per UTXO):**
  - `category`: 32-byte ID (equals the `txid` of the genesis transaction whose **input 0 spent output index 0 (`vout == 0`)**).
  - `amount`: Fungible Token (FT) integer (`1 .. 9,223,372,036,854,775,807`).
  - `nft`: Optional single NFT per UTXO with `capability` (`none` immutable, `mutable`, `minting`) and `commitment` (`0–40` bytes).
  - *Note:* An output can hold **0 or 1 NFT** + **any amount of FT of the SAME category**, plus BCH satoshis.
  - Tokens are implicitly burned if omitted from outputs.
- **Address Compatibility:**
  - Token-aware addresses use the **`bitcoincash:z...`** CashAddr prefix (vs **`bitcoincash:q...`** for BCH-only). Always use `z...` when receiving CashTokens (`EMBER2026`, minted NFTs/FTs).
- **BCMR (Bitcoin Cash Metadata Registry):**
  - Authenticated JSON metadata (token name, ticker, decimals, icon, NFT commitment schema) published off-chain (HTTPS/IPFS) and anchored on-chain via `OP_RETURN` hash / AuthChain (`authbase` identity UTXO).

---

## 4. SDK, Transaction Building & Wallet Connectivity

- **CashScript TypeScript SDK (`cashscript` v0.12+):**
  - Uses **`TransactionBuilder`** (the legacy single-contract `.functions.foo().to().send()` API was removed in v0.12).
  - Add inputs with `addInput(utxo, unlocker)` / `addInputs(...)`, outputs with `addOutput(...)` / `addOpReturnOutput(...)`, and timelocks with `setLocktime(...)`.
  - Fee = `sum(inputs.value) - sum(outputs.value)` — **always explicitly compute change** so you don't accidentally burn excess BCH as miner fee!
  - Keypair & low-level encoding via **`@bitauth/libauth`**.
- **Network Providers (No paid RPC keys needed):**
  - **Unit/Integration Tests:** `MockNetworkProvider` + `randomUtxo()` (instant, offline, zero cost).
  - **Testnet:** `ElectrumNetworkProvider('chipnet')` (public Fulcrum servers, free tBCH faucets).
  - **Mainnet:** `ElectrumNetworkProvider('mainnet')` (public Fulcrum servers; Chaingraph/Haskoin/Riften Labs APIs for advanced indexing).
- **WizardConnect vs BCH WalletConnect (`wc2-bch-bcr`):**
  - **WizardConnect** (`@wizardconnect/core`, `@wizardconnect/dapp`, `@wizardconnect/react`) is **HD-wallet-aware** over Nostr NIP-17 encrypted relays (default `relay.riften.net`). Wallet shares named BIP32 xpubs (`receive`, `change`, `defi`); dApp derives addresses locally with zero extra round-trips.
  - **With CashScript:** Build the transaction using `placeholderP2PKHUnlocker(userAddress)` (and `placeholderSignature()` / `placeholderPublicKey()` where wallet signs contract inputs), call `txBuilder.generateWcTransactionObject()`, and attach **`inputPaths: [inputIndex, pathName, addressIndex][]`** matching the **final input order**.
  - **Caveat:** WizardConnect supports transaction signing and custom extensions, **not** generic arbitrary message signing (`bch_signMessage` is WalletConnect v2).
  - **Supported Wallets:** **Cashonize** (Web/Desktop/Android; supports WalletConnect, CashConnect, WizardConnect), **Paytaca** (Mobile/Chrome Extension; supports WalletConnect, WizardConnect), **Selene Wallet** (Mobile; supports WizardConnect).

---

## 5. Development, Debugging & Security Workflow

1. **Test locally first (`MockNetworkProvider`):** Validate happy paths + adversarial edge cases (wrong outputs, dust, replay, fee drain, integer floor division) offline.
2. **Debug cleanly:** Use `.debug()` in CashScript SDK (evaluates locally via Libauth VM), `console.log(...)` inside `.cash` files, or `getBitauthUri()` to step through opcodes in **Bitauth IDE** *(never paste mainnet private keys into online Bitauth IDE)*.
3. **Stage on `chipnet`:** Test real wallet UX (WizardConnect QR/signing with Cashonize/Paytaca on Chipnet) using free faucet coins (`tbch.googol.cash`, `faucet.paytaca.com`).
4. **Ship to `mainnet`:** Switch provider to `'mainnet'`, verify `bitcoincash:z...` vs `q...` addresses, test 1–2 real low-value transactions (`~1,000` sats), and confirm explorer links (`blockchair`, `explorer.salemkode.com`, etc.).
