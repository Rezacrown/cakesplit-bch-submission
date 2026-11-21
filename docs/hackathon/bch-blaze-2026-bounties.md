# BCH BLAZE 2026 — Bounties, Sponsor Challenges & Winning Paths Analysis

**Snapshot Date:** 2026-11-21 (~30 hours before `2026-11-22 14:00 UTC` / `21:00 WIB` submission deadline)  
**Target Profile:** Solo builder, 0 prior Bitcoin Cash experience, AI-assisted development, missed Roll Call (low-priority queue for Mainnet/Media Tracks).  
**Primary Sources Verified:** DoraHacks (`bchblaze2026`), `bchblaze.cash/bounties/*`, sponsor repositories & docs (`stack.xo.cash`, `github.com/solidcash/solidcash`, `paryonusd.com`, `folding.cash`, `cashtokenmarkets.bch-1.org`, `bitcoincashresearch.org`).

---

## 1. Executive Summary & Total Prize Landscape

Across **6 official bounties**, BCH BLAZE 2026 offers a combined bounty pool of **`11.5 BCH + $1,250 PUSD + 26M FLDCH`** ([`bchblaze.cash/bounties/`](https://bchblaze.cash/bounties/)), alongside the main hackathon pools (`$5,750 PUSD` Mainnet Track, `$1,000 PUSD` Media Track, `$750 PUSD` Community Choice via `EMBER2026`, and `$250 PUSD` TokenHunt completion airdrop) ([DoraHacks Detail](https://dorahacks.io/hackathon/bchblaze2026/detail)).

> [!IMPORTANT]
> **Missed Roll Call Impact:** Per [DoraHacks Detail](https://dorahacks.io/hackathon/bchblaze2026/detail), missing Roll Call puts your project in the **low-priority judging queue** for the **Mainnet Track** and **Media Track** (reviewed only after Roll Call teams, unless viral social/word-of-mouth traction draws judge attention or you join a Roll Call team). Sponsor bounties are evaluated against each bounty's specific qualifying criteria—making **multi-winner or web-native bounties** the highest-ROI target for a late-joining solo developer.

### Quick Comparison Matrix (All 6 Bounties)

| Bounty | Sponsor | Prize Pool | Winners | Mainnet Required? | WizardConnect / XO Required? | Competing Builds Spotted | Tier |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- | :---: |
| **Build with XO** | General Protocols | **3.0 BCH** (`0.3 BCH × 10`) | Up to 10 | No (Chipnet OK) | **XO Template** + `blaze.xo.cash` | ~4–5 spotted (10 slots open!) | **Tier A** |
| **Decentralized Identity** | Paytaca | **$500 PUSD** | 1 | Recommended (for stretch/Mainnet Track) | Recommended if stacking Mainnet Track | ~4 spotted (`BCH × Nostr Identity Link`, `XO Identity`, `TwinKey`, `BCH × Nostr Identity`) | **Tier A** |
| **Migrate to XO** | General Protocols | **5.0 BCH** (`1.0 BCH × 5`) | Up to 5 | No (Chipnet OK) | **XO Template** + `blaze.xo.cash` | ~1–2 spotted (`XO Mecenas`) | **Tier B** |
| **Best SolidCash Application** | `mainnet_pat` | **3.5 BCH** (`2 / 1 / 0.5 BCH`) | Top 3 | **Yes (Mandatory)** | No (PRs to `solidcash/solidcash` expected) | `FoldClaim` (strong), possibly others | **Tier B** |
| **Stablecoin Bridge** | BCH BLAZE | **$750 PUSD** | 1 | **Yes (Practical)** | WizardConnect + EVM/other WalletConnect | `Hashi` (near-complete mainnet 8-chain bridge) | **Tier C** |
| **FoldingCash Reward Claims** | FoldingCash | **26M FLDCH** (~$104 USD nominal) | 1 | No (Chipnet demo OK) | No | `FoldClaim` (mainnet live), `ClaimForge` | **Tier C** |

*Reference BCH price benchmark in repo notes: `1 BCH ≈ $199.17 USD` (see [`bch-blaze-2026.md`](file:///home/antigravity/Rezacrown/bch-blaze-hackathon/docs/hackathon/bch-blaze-2026.md#L93)).*

---

## 2. Non-Bounty Tracks & Side Pools (Stacking Context)

Before diving into individual bounties, note the rules for the main hackathon pools ([DoraHacks Detail](https://dorahacks.io/hackathon/bchblaze2026/detail), [DoraHacks Tracks](https://dorahacks.io/hackathon/bchblaze2026/tracks), [TokenHunt](https://bchblaze.cash/tokenhunt/)):

- **Mainnet Track (`$3,500` / `$1,500` / `$750 PUSD` + BLISS 2027 tickets):**
  - Requires: live clickable web demo, at least 1 real **BCH mainnet** transaction executable by judges, **WizardConnect OR XO Template** integration, public GitHub/GitLab repo, **top-of-page banner** linking Widget Factory slides + repo + `bitcoincash:z...` CashTokens address (`EMBER2026`), and Telegram verification in `@bchblaze` ([DoraHacks Detail](https://dorahacks.io/hackathon/bchblaze2026/detail)).
  - **73 total builds** submitted across all tracks as of 2026-11-21 ([DoraHacks Builds](https://dorahacks.io/hackathon/bchblaze2026/build)).
- **Media Track (`$1,000 PUSD`):**
  - Not mutually exclusive with Mainnet Track; judged solely by Jeremy for engaging/viral BCH media (videos, songs, comics, AI art, NFTs) with hosted link + `EMBER2026` address ([DoraHacks Detail](https://dorahacks.io/hackathon/bchblaze2026/detail)).
- **Community Choice Award (`$750 PUSD`):**
  - Automatically includes all eligible Mainnet & Media Track projects that display a valid CashTokens address (`bitcoincash:z...`) for `EMBER2026` donations (distributed to BLISS Belle NFT holders) ([DoraHacks Detail](https://dorahacks.io/hackathon/bchblaze2026/detail)).
- **TokenHunt Completion Pool (`$250 PUSD`):**
  - Airdropped to completed projects participating in TokenHunt (`https://bchblaze.cash/tokenhunt/`, [DoraHacks Detail](https://dorahacks.io/hackathon/bchblaze2026/detail)).

---

## 3. Detailed Breakdown of All 6 Bounties

### 3.1 Build with XO
- **Sponsor:** General Protocols ([`xo.cash`](https://xo.cash/) / [`stack.xo.cash`](https://stack.xo.cash/))
- **Prize Pool:** **3.0 BCH total (`0.3 BCH × 10 winners`)**
- **Primary Source:** [`https://bchblaze.cash/bounties/build-with-xo/`](https://bchblaze.cash/bounties/build-with-xo/) (cross-referenced with [`Migrate to XO`](https://bchblaze.cash/bounties/migrate-to-xo/) and [`bchblaze.cash/bounties/`](https://bchblaze.cash/bounties/))
- **Technical & Eligibility Requirements:**
  1. Create a novel, well-designed, functional **XO template** that correctly implements its intended smart contract ([`build-with-xo`](https://bchblaze.cash/bounties/build-with-xo/)).
  2. Demonstrate XO functionality by executing a transaction on **Chipnet or Mainnet** using an **invitation** that can be inspected with the XO debug tool ([`https://blaze.xo.cash/`](https://blaze.xo.cash/)) ([`build-with-xo`](https://bchblaze.cash/bounties/build-with-xo/), [`XO Mecenas`](https://dorahacks.io/build/51303)).
  3. Submit the invitation(s) used to execute the transaction, plus instructions to reproduce them ([`build-with-xo`](https://bchblaze.cash/bounties/build-with-xo/)).
  4. Showcase the use of **follow-up actions**, if applicable to the underlying contract structure ([`build-with-xo`](https://bchblaze.cash/bounties/build-with-xo/)).
  5. Provide **detailed, personally written developer feedback** on your experience developing with XO (what worked well, areas for improvement, missing functionality, reproducible issues). **AI-written feedback is explicitly rejected** (subjectively enforced; **recommended word count: 500 words**) ([`build-with-xo`](https://bchblaze.cash/bounties/build-with-xo/), [`migrate-to-xo`](https://bchblaze.cash/bounties/migrate-to-xo/)).
  6. Use the latest `@xo-cash` engine version (`0.1.0-next.xxx` on npm) and check General Protocols Telegram / `gitlab.com/GeneralProtocols/xo` ([`migrate-to-xo`](https://bchblaze.cash/bounties/migrate-to-xo/)).
- **Mainnet & Wallet Requirement:**
  - **Chipnet-only is explicitly allowed** for the bounty itself (faucets: `tbch.googol.cash/`, `chipnet.bch.ninja/`) ([`build-with-xo`](https://bchblaze.cash/bounties/build-with-xo/)).
  - *"To qualify for the mainnet track, use only minimal funds, and only when you know you can get them back"* ([`build-with-xo`](https://bchblaze.cash/bounties/build-with-xo/)).
  - Uses **XO Template** (satisfies Mainnet Track's "WizardConnect or XO Template" rule if also deployed on mainnet with live web UI + banner).
- **Existing Competition Spotted on DoraHacks:**
  - [`XO Inheritance Vault`](https://dorahacks.io/build/51440) — Dead-man's switch P2SH32 covenant (`create`, `poke`, `claim`, `updateBeneficiary`, `reclaim` on Chipnet; 29 unit tests + 739-word personal feedback).
  - [`EmberVault — Hashlock Tip Vault (XO Template)`](https://dorahacks.io/build/51322) — Two-party hashlock + CLTV refund tip vault on Chipnet.
  - `Layaway Jar` ([Matrix Neo builder profile](https://dorahacks.io/builder/matrixneoaiagent)) — On-chain layaway savings covenant (1 XO template, 3 spend paths).
  - `Grandma's Wallet` & `XO Identity` ([DoraHacks Builds](https://dorahacks.io/hackathon/bchblaze2026/build)) — XO stack wallet recovery & XO+Identity apps (may target Mainnet/Paytaca/XO).
  - **Slot availability:** With **10 winner slots** and only ~4–6 clear XO template builds visible out of 73 total hackathon builds, slots are still wide open!

---

### 3.2 Decentralized Identity
- **Sponsor:** Paytaca ([`paytaca.com`](https://www.paytaca.com/))
- **Prize Pool:** **$500 PUSD**
- **Primary Source:** [`https://bchblaze.cash/bounties/decentralized-identity/`](https://bchblaze.cash/bounties/decentralized-identity/)
- **Technical & Eligibility Requirements:**
  1. **Identity creation & management:** Users hold their own keys and link a BCH wallet identity with a Nostr identity, with **no centralized identity provider or custodial service**.
  2. **Cryptographic identity binding:** Verifiable link between BCH and Nostr identities backed by **proofs of control over both**, without exposing private keys or reusing the same key across both. **Simply listing a BCH address in a Nostr profile does NOT count.**
  3. **Decentralized discovery:** Third parties can discover identity data via Nostr relays (or another decentralized method) with enough data to verify the link, without a proprietary database.
  4. **Verification & authentication:** Independent apps can verify the association and authenticate users (e.g., challenge-response) without contacting a central authority.
  5. **Working demonstration & documentation:** Working prototype, source code, setup instructions, and architecture/verification documentation.
  6. **Open standards:** Build on Nostr NIPs, BCH signatures/txs, CashTokens, DIDs, W3C VCs rather than proprietary formats. (Note recent Nov 2026 ecosystem context: [Cashonize #405 / Paytaca `30078` + `10011` + dual-signature draft spec](https://bitcoincashresearch.org/t/draft-spec-bch-payment-address-from-a-nostr-npub-cashonize-405/2291) and [DoraHacks Discussion #1562264](https://dorahacks.io/discussion/1562264) noting WizardConnect lacks `signMessage`, so BCH control can be proved via an `OP_RETURN` proof tx or BCH WalletConnect `signMessage` / BIP-137).
  - **Stretch Goals:** Pay BCH/CashTokens via identity without manually exchanging addresses; third-party attestations / VCs; portable reputation; key rotation/recovery; selective disclosure; reusable libraries/specs; on-chain BCH/CashToken commitments where clearly justified.
- **Mainnet & Wallet Requirement:**
  - Bounty page requires a **working proof-of-concept demo** (does not strictly mandate mainnet unless you want Mainnet Track + stretch goal #1).
  - Adding a **"Pay via Nostr Identity"** flow via **WizardConnect** on mainnet satisfies Mainnet Track + Stretch Goal #1 simultaneously.
- **Existing Competition Spotted on DoraHacks:**
  - `BCH × Nostr Identity Link` ([DoraHacks Builds](https://dorahacks.io/hackathon/bchblaze2026/build)) — Dual-signed statement, 7 offline verification checks.
  - `XO Identity` ([DoraHacks Builds](https://dorahacks.io/hackathon/bchblaze2026/build)) — Writes binding ID into a CashToken, pays named BCH address.
  - `TwinKey` ([DoraHacks Builds](https://dorahacks.io/hackathon/bchblaze2026/build)) — Dual-signed NIP-39 claim on ordinary Nostr relays; discover, verify, pay, and log in.
  - `BCH × Nostr Identity` ([Matrix Neo](https://dorahacks.io/builder/matrixneoaiagent)) — Browser-created binding published to public relays, offline verifiable.

---

### 3.3 Migrate to XO
- **Sponsor:** General Protocols ([`xo.cash`](https://xo.cash/))
- **Prize Pool:** **5.0 BCH total (`1.0 BCH × 5 winners`)**
- **Primary Source:** [`https://bchblaze.cash/bounties/migrate-to-xo/`](https://bchblaze.cash/bounties/migrate-to-xo/)
- **Technical & Eligibility Requirements:**
  1. Integrate XO into an existing project or **migrate existing functionality to a novel, well-designed, functional XO template** that correctly implements its intended contract (UI/UX may be adapted).
  2. Demonstrate XO functionality by executing a transaction on **Chipnet or Mainnet** using an invitation inspectable with [`https://blaze.xo.cash/`](https://blaze.xo.cash/).
  3. Submit the XO template, invitation(s) used, and reproduction instructions.
  4. Showcase follow-up actions if applicable.
  5. Provide links to **both the original working project and the XO implementation**.
  6. Provide **~500 words of personally written developer feedback** (AI-written submissions rejected).
  7. Caution on bounty page: *"XO is still in early development. Some applications may not be possible, or may be entirely unfeasible with the current stack. It is important to maintain ongoing discussion with the XO team to assess feasibility."*
- **Mainnet & Wallet Requirement:**
  - **Chipnet allowed** (`tbch.googol.cash/`, `chipnet.bch.ninja/`); Mainnet only needed if also entering Mainnet Track. Uses **XO Template**.
- **Existing Competition Spotted on DoraHacks:**
  - [`XO Mecenas`](https://dorahacks.io/build/51303) — Migrates CashScript's Licho's Mecenas recurring-payment covenant to XO (`create`, `withdraw`, `withdrawFinal`, `reclaim` with real BIP68 CSV on Chipnet, 19 unit tests, 540-word feedback, 10 findings).
  - Very few clear `Migrate to XO` competitors spotted out of 5 winner slots, though quality bar set by `XO Mecenas` is high.

---

### 3.4 Best SolidCash Application
- **Sponsor:** `mainnet_pat` (`x.com/mainnet_pat`, `t.me/mainnet_pat`)
- **Prize Pool:** **3.5 BCH total (`1st: 2.0 BCH`, `2nd: 1.0 BCH`, `3rd: 0.5 BCH`)**
- **Primary Source:** [`https://bchblaze.cash/bounties/best-solidcash-application/`](https://bchblaze.cash/bounties/best-solidcash-application/) (and [`https://github.com/solidcash/solidcash`](https://github.com/solidcash/solidcash))
- **Technical & Eligibility Requirements:**
  1. Develop a Solidity smart contract compiled natively to BCH via **SolidCash** (`@solidcash/solidc` / `@solidcash/testing` / SolidCash TS SDK).
  2. Contract must be **deployable and runnable on BCH mainnet** (not mocknet-only!).
  3. Encouraged to use **most SolidCash features and syntax** and focus on the smart contract, with contributions to `solidcash/solidcash` **in the form of Pull Requests** ([`bchblaze.cash/bounties/`](https://bchblaze.cash/bounties/)).
  4. **Critical Engineering Caveats from [`solidcash/solidcash` README](https://github.com/solidcash/solidcash):**
     - Larger multi-contract fixtures easily exceed BCH's **10,000-byte per-input script limit** (7 of 19 marketplace artifacts exceed it; *"Treat this release as a mocknet beta for anything at marketplace scale"*).
     - In default `direct` mode, **`msg.sender` is NOT authenticated** (audit finding F1/F10) — developers must use explicit `checkSig` or `framed` mode (which uses 12 master + 4 validator UTXOs).
- **Mainnet & Wallet Requirement:**
  - **Mainnet deployment & execution REQUIRED.** WizardConnect/XO not strictly specified by the SolidCash bounty itself, but required for Mainnet Track.
- **Existing Competition Spotted on DoraHacks:**
  - [`FoldClaim`](https://dorahacks.io/build/51312) — Built in SolidCash 0.51 on the 2026 VM, live on **mainnet** with 10+ verified txs, gasless relayer, 50+ tests, AND already opened upstream PRs `solidcash#4` and `solidcash#5`. **Very strong favorite for 1st place (`2 BCH`)**, leaving `1.0 BCH` (2nd) and `0.5 BCH` (3rd) potentially open if few other SolidCash mainnet apps submit.

---

### 3.5 Stablecoin Bridge
- **Sponsor:** BCH BLAZE (`bchblaze.cash`, `t.me/bchblaze`)
- **Prize Pool:** **$750 PUSD**
- **Primary Source:** [`https://bchblaze.cash/bounties/stablecoin-bridge/`](https://bchblaze.cash/bounties/stablecoin-bridge/)
- **Technical & Eligibility Requirements:**
  1. Build an application allowing users to **bridge or swap stablecoins into and out of BCH** (e.g., USDC on Ethereum → **PUSD** on BCH, and PUSD on BCH → USDC on Ethereum).
  2. Swap between BCH stablecoins and **at least 1 other ecosystem** is sufficient; multiple ecosystems is better.
  3. **BCH side:** **WizardConnect** is highly recommended. **Other chain side:** **WalletConnect** (or chain-native standard) is practically essential.
  4. **Stretch Goals:** Support multiple BCH stablecoins ([ParyonUSD / PUSD](https://paryonusd.com) + [MoriaUSD / MUSD](https://docs.moria.money/developer-resources/)); route through existing multicoin providers (ShapeShift, THORChain, etc.); secure cross-ecosystem promotion.
  5. **Additional Note:** ParyonUSD (`PUSD`, CashToken ID `2469acc5afa4b10cb5b5c04afb89c3a3ffd61c5da9c01e26d00951cae2a02544`) is a BLAZE sponsor and first-priority integration target.
- **Mainnet & Wallet Requirement:**
  - Practically requires **Mainnet** + **WizardConnect** + **WalletConnect** on EVM/source chain.
- **Existing Competition Spotted on DoraHacks:**
  - [`Hashi`](https://dorahacks.io/build/51340) — **Massive incumbent.** Already live on mainnet (`hashi.cash`) bridging USDC/USDT across **8 chains** (Ethereum, Base, Arbitrum, Optimism, Polygon, Avalanche, BNB Chain, Solana) ↔ **PUSD, MUSD, and BCH** via **NEAR Intents + THORChain + Cauldron Router**, using **WizardConnect + Reown AppKit**, with 6 verified mainnet txs filmed in a demo video.

---

### 3.6 Trust-minimized, pull-based reward claims for FoldingCash
- **Sponsor:** FoldingCash ([`folding.cash`](https://folding.cash/), `github.com/foldingcash`)
- **Prize Pool:** **26,000,000 FLDCH** (FoldingCash CashToken)
- **Primary Source:** [`https://bchblaze.cash/bounties/foldingcash-reward-claims/`](https://bchblaze.cash/bounties/foldingcash-reward-claims/)
- **Market Valuation Check:**
  - Per [CashToken Markets (`FLDCH`)](https://cashtokenmarkets.bch-1.org/tokens/0adb865ee9cc3038de87fba682e6cd361414edc9acff0da2fd0690d75341c640), `FLDCH` trades at **`$0.000004`** (`$727.97` market cap, **`$1.33K` TVL**, **`$18.32` volume**).
  - `26M FLDCH × $0.000004 ≈ $104 USD` nominal (with severe slippage to liquidate ~13.8% of the `188.56M` circulating supply into a `$1.33K` TVL pool).
- **Technical & Eligibility Requirements:**
  - **Root publication:** Publish Merkle root of `(address, cumulative earned)` per epoch.
  - **Pool contract:** Holds reward tokens (`FLDCH`), verifies Merkle proof on-chain, enforces single-claim receipts / delta payouts, and answers FoldingCash's open design questions (epoch cadence, max leaves, root authority, receipt layout, link verification).
  - **Deliverable:** Chipnet demo with a few hundred leaves + cost comparison vs current monthly push model (~875 sats/user/distribution).
- **Mainnet & Wallet Requirement:** Chipnet demo sufficient for bounty.
- **Existing Competition Spotted on DoraHacks:**
  - [`FoldClaim`](https://dorahacks.io/build/51312) — Already live on mainnet with 2026-VM Merkle proof loop, 144-block CSV timelocked `RootRegistry`, `FoldClaimPool`, gasless relayer, 50+ tests, and full cost/open-question writeup.
  - `ClaimForge` ([DoraHacks Builds](https://dorahacks.io/hackathon/bchblaze2026/build)) — Also implements Merkle root pull-based payment claims.

---

## 4. Feasibility Ranking for a 30-Hour Solo Sprint (0 Prior BCH Experience)

### Tier A — Most Possible / Best ROI in <24–30 Hours

#### 1. `Build with XO` (`0.3 BCH × 10 winners = 3.0 BCH`)
- **Why Tier A:**
  - **Highest win probability:** **10 winner slots** and only ~4–6 clear XO template builds visible so far out of 73 hackathon submissions.
  - **Zero mainnet friction:** Chipnet-only is explicitly allowed, eliminating mainnet exchange onboarding/withdrawal delays and real-funds debugging risk.
  - **AI-friendly structure:** Bottom-up XO template structure (`scripts` → `lockingScripts` → `actions` → `transactions`) is well-documented in [`Vision to Reality 6: Writing Templates`](https://stack.xo.cash/blog/2026-08-24-Vision-to-Reality-6-Writing-Templates) and [`@GeneralProtocols/xo/types`](https://gitlab.com/GeneralProtocols/xo/types/-/blob/development/source/template.ts).
- **Required Tech Stack:**
  - TypeScript / Node.js, `@xo-cash/*` npm packages (`0.1.0-next.xxx`), `@bitauth/libauth` (for VM unit tests), CashASM (or a tiny compiled CashScript contract embedded in `scripts`), Chipnet faucet (`tbch.googol.cash/` / `chipnet.bch.ninja/`), and [`blaze.xo.cash`](https://blaze.xo.cash/) debug tool.
- **Critical Execution Rules:**
  - Keep scope to **1 simple, rock-solid covenant** (e.g., 2-party Hashlock + Timeout Escrow, Milestone Tip Jar, or Split-Pay Receipt) with 2–3 clean actions.
  - Commit real Chipnet txids, exported invitation JSONs, debug-tool screenshots, and **write the ~500-word XO developer feedback 100% yourself** (no AI prose!).

#### 2. `Decentralized Identity` (Paytaca — `$500 PUSD`)
- **Why Tier A:**
  - **Zero custom smart contract required:** A solo web/TypeScript developer with 0 BCH VM experience can implement cryptographic BCH + Nostr binding using standard JS libraries (`nostr-tools`, `@bitauth/libauth`, `WizardConnect` / `BCH WalletConnect`).
  - **Clear standards blueprint already exists:** The Nov 2026 [`bitcoincashresearch.org` Cashonize #405 draft spec](https://bitcoincashresearch.org/t/draft-spec-bch-payment-address-from-a-nostr-npub-cashonize-405/2291) + [`DoraHacks #1562264`](https://dorahacks.io/discussion/1562264) lay out exact pitfalls to avoid:
    - Do **not** rely solely on `kind 30078` (NIP-78 #2458 restricted generic interchange; support dedicated event kind or NIP-39 `kind 10011` `bch:` `i`-tag + `paytaca:bch-address` fallback).
    - Prove **both keys** independently (Nostr event signature + BCH signature or `OP_RETURN` proof tx committing to `npub`, without reusing the same key across both!).
  - **Best single-MVP stacking vehicle** (see Section 5).
- **Required Tech Stack:**
  - Next.js / Vite + React + TypeScript, `nostr-tools` (NIP-07 browser extension + public relays), `@bitauth/libauth`, `@wizardconnect/core` + `@wizardconnect/dapp` (for mainnet payment stretch goal), optional Fulcrum/Haskoin public API for verifying `OP_RETURN` proof txs.

---

### Tier B — Possible with Tight Scope (High Execution Risk in 30 Hours)

#### 3. `Migrate to XO` (`1.0 BCH × 5 winners = 5.0 BCH`)
- **Why Tier B:** Higher reward per slot (`1.0 BCH`) and Chipnet-only is allowed, with only ~1–2 obvious migrations (`XO Mecenas`) spotted. However, for a newcomer with 0 BCH background, migrating a legacy CashScript covenant into XO's alpha engine + reproducing exact introspection/timelock behavior + writing 500 words of migration feedback carries high debugging risk in 30 hours. Only attempt if you pick a **tiny single-file CashScript contract** (e.g., Hodl Vault or 2-of-3 Escrow) and verify feasibility against `@xo-cash` early.
- **Tech Stack:** CashScript (reading original contract), `@xo-cash/*`, CashASM, `libauth` VM vectors, `blaze.xo.cash`.

#### 4. `Best SolidCash Application` (`3.5 BCH`: `2 / 1 / 0.5 BCH`)
- **Why Tier B:** `2nd` (`1 BCH`) or `3rd` (`0.5 BCH`) place may be realistic if few SolidCash apps deploy to mainnet, since `FoldClaim` already locks down a strong contender for 1st. However, **mandatory mainnet deployment**, SolidCash's **10,000-byte script ceiling**, unauthenticated `msg.sender` in `direct` mode ([`solidcash` README](https://github.com/solidcash/solidcash)), and the expectation of **upstream PRs to `solidcash/solidcash`** make this tight for a 30-hour BCH beginner.
- **Tech Stack:** `@solidcash/solidc`, SolidCash TS SDK, `@solidcash/testing`, BCH mainnet wallet with ~`0.01–0.02 BCH` (`Rp 50k–100k`) for deployment/testing.

---

### Tier C — Avoid (Too Heavy or Already Saturated)

#### 5. `Stablecoin Bridge` (`$750 PUSD`)
- **Why Tier C:** Single-winner prize and **`Hashi`** ([`dorahacks.io/build/51340`](https://dorahacks.io/build/51340)) has already shipped a production-grade mainnet bridge across 8 chains, 14 stablecoins, NEAR Intents + THORChain + Cauldron DEX, with both WizardConnect and Reown AppKit + filmed mainnet swaps. Starting from zero in 30 hours to beat `Hashi` is negative EV.

#### 6. `FoldingCash Reward Claims` (`26M FLDCH`)
- **Why Tier C:** Nominal prize value is only **`~$104 USD`** (`26M × $0.000004`, with `$1.33K` pool TVL per [CashToken Markets](https://cashtokenmarkets.bch-1.org/tokens/0adb865ee9cc3038de87fba682e6cd361414edc9acff0da2fd0690d75341c640)), requires complex 2026-VM Merkle proof covenants, and **`FoldClaim`** ([`dorahacks.io/build/51312`](https://dorahacks.io/build/51312)) + `ClaimForge` have already shipped complete implementations.

---

## 5. Single-MVP Stacking Strategy (30-Hour Execution Blueprint)

Because you missed Roll Call, **do not rely solely on the Mainnet Track general queue**. Instead, design **one focused MVP** that wins via **sponsor bounty judging** while checking every Mainnet Track / Media Track / Community Choice / TokenHunt box so you remain eligible for stacked upside.

### Chosen Execution Blueprint — `Build with XO` + `Mainnet Track` + `Media Track` *(Active Plan)*
Combining your selected **Build with XO** bounty with **Mainnet Track** and **Media Track** works cleanly with **one cohesive project**:

1. **Stage 1 — XO Template & Chipnet Proof (`Build with XO`, `0.3 BCH × 10`):**
   - Build 1 clean, novel **XO Template** (`@xo-cash` `0.1.0-next.xxx`) with 2–3 clear actions (`create`, follow-up action(s), `reclaim`/settlement), CashVM introspection checks, and `libauth` unit tests.
   - Run & verify all actions on **Chipnet** first (Rp 0 via faucets), export invitation JSONs, and inspect/screenshot them in [`https://blaze.xo.cash/`](https://blaze.xo.cash/).
   - Write **500+ words of genuine personal developer feedback** on XO's SDK/template ergonomics (never AI-written).
2. **Stage 2 — Live Web UI + Minimal Mainnet Tx (`Mainnet Track`, `$3,500`/`$1,500`/`$750 PUSD`):**
   - Wrap the XO Template in a crisp, zero-friction web demo hosted live (satisfies Mainnet Track's `"WizardConnect OR XO Template"` rule — add WizardConnect as well if needed for smoother wallet UX).
   - Enable real **BCH Mainnet** execution using minimal, recoverable funds (per XO bounty guidance: *"To qualify for the mainnet track, use only minimal funds, and only when you know you can get them back"*).
   - Add the **mandatory top-of-page banner** on the home page:
     1. **Widget Factory** slides link ([template](https://docs.google.com/presentation/d/1Yfuk9CJkf4U9M_WukcELhumWgj3Ak6345Ewy8hSp-Hk/edit?usp=sharing))
     2. Public **GitHub repository** link (`Rezacrown/bch-blaze-hackathon`)
     3. **`bitcoincash:z...` CashTokens address** for `EMBER2026` donations (**Community Choice `$750 PUSD`**)
   - Confirm the project in **`@bchblaze` Telegram** (**Mainnet Track** + **TokenHunt `$250 PUSD`** eligibility).
3. **Stage 3 — Engaging BCH Media Piece (`Media Track`, `$1,000 PUSD` + Social Escape):**
   - Produce a short, punchy, shareable media artifact (e.g., 45–60s video/skit/visual explainer showing your real BCH Mainnet XO app in action + BCH's instant sub-cent UX).
   - Host it publicly (YouTube/X/web page) with a clear description/banner containing your **`bitcoincash:z...` `EMBER2026` address** and post it on X/Telegram to both compete in Media Track and build social visibility to escape the low-priority queue.

### Alternative Blueprint A — Paytaca Identity + "Pay-by-`npub`" Mainnet MVP *(Backup if XO blocks)*
1. **Core Bounty Target:** **Paytaca Decentralized Identity (`$500 PUSD`)**
   - Web app where a user connects a Nostr key (NIP-07 / generated ephemeral session) + a BCH wallet (**WizardConnect**).
   - Generates a **dual-signed binding** (Nostr signed event + BCH proof-of-control via `OP_RETURN` tx or WalletConnect signature—never reusing the same key) and publishes to public Nostr relays (`kind 10011` `bch:` `i`-tag + dedicated binding event, plus read-only fallback for Paytaca's `30078` `paytaca:bch-address`).
   - Provides a **1-click Verification & Challenge-Response Auth** tester for third-party apps (no backend database).
2. **Mainnet Track + Paytaca Stretch Goal #1 Stack:**
   - Add a **"Send BCH / CashTokens to `npub`"** checkout widget powered by **WizardConnect** on **BCH Mainnet**.

### Alternative Blueprint B — Pure `Build with XO` Chipnet-Only Sprint *(Fallback if Mainnet funds/time run out)*
1. Target **`Build with XO` (`0.3 BCH × 10 winners`)** on **Chipnet** only.
2. Ship the tested XO template, Chipnet invitation JSONs, `blaze.xo.cash` screenshots, and 500+ words of personal developer feedback.

---

## 6. Verification & Source Index

| Source | Type | What Was Verified |
| :--- | :--- | :--- |
| [`https://dorahacks.io/hackathon/bchblaze2026/detail`](https://dorahacks.io/hackathon/bchblaze2026/detail) | Primary (DoraHacks) | Timeline, Roll Call low-priority queue policy, Mainnet/Media/Community Choice/TokenHunt rules, judges, Widget Factory template |
| [`https://dorahacks.io/hackathon/bchblaze2026/tracks`](https://dorahacks.io/hackathon/bchblaze2026/tracks) | Primary (DoraHacks) | Mainnet Track (`$3,500`/`$1,500`/`$750 PUSD` + BLISS 2027) & Media Track (`$1,000 PUSD`) rules |
| [`https://dorahacks.io/hackathon/bchblaze2026/build`](https://dorahacks.io/hackathon/bchblaze2026/build) | Primary (DoraHacks) | 73 submitted builds, bounty filter categories (`BCH BLAZE`, `General Protocols`, `Paytaca`, `Mainnet_Pat`), active competitors |
| [`https://bchblaze.cash/bounties/`](https://bchblaze.cash/bounties/) | Primary (Official Portal) | Exact total across 6 bounties: `11.5 BCH + $1,250 PUSD + 26M FLDCH` |
| [`https://bchblaze.cash/bounties/build-with-xo/`](https://bchblaze.cash/bounties/build-with-xo/) | Primary (Official Portal) | `0.3 BCH × 10`, Chipnet/Mainnet rules, `blaze.xo.cash` debug tool, 500-word personal feedback |
| [`https://bchblaze.cash/bounties/migrate-to-xo/`](https://bchblaze.cash/bounties/migrate-to-xo/) | Primary (Official Portal) | `1 BCH × 5`, migration requirements, links to both repos, 500-word personal feedback, `@xo-cash` `0.1.0-next.xxx` |
| [`https://bchblaze.cash/bounties/decentralized-identity/`](https://bchblaze.cash/bounties/decentralized-identity/) | Primary (Official Portal) | `$500 PUSD` Paytaca bounty, 5 core requirements, 7 stretch goals, open-standards guidance |
| [`https://bchblaze.cash/bounties/best-solidcash-application/`](https://bchblaze.cash/bounties/best-solidcash-application/) | Primary (Official Portal) | `3.5 BCH` (`2 / 1 / 0.5 BCH`), `mainnet_pat`, mainnet deployment requirement, `solidcash/solidcash` PRs |
| [`https://bchblaze.cash/bounties/stablecoin-bridge/`](https://bchblaze.cash/bounties/stablecoin-bridge/) | Primary (Official Portal) | `$750 PUSD`, cross-chain stablecoin swap into/out of BCH (`PUSD`/`MUSD`), WizardConnect + WalletConnect |
| [`https://bchblaze.cash/bounties/foldingcash-reward-claims/`](https://bchblaze.cash/bounties/foldingcash-reward-claims/) | Primary (Official Portal) | `26M FLDCH`, Merkle root + pool contract + Chipnet demo + cost comparison + open questions |
| [`https://bchblaze.cash/tokenhunt/`](https://bchblaze.cash/tokenhunt/) | Primary (Official Portal) | TokenHunt CashToken treasure hunt & forge mechanics |
| [`https://dorahacks.io/build/51340`](https://dorahacks.io/build/51340) | Primary (DoraHacks Build) | `Hashi` competing Stablecoin Bridge submission (8 chains, NEAR Intents, THORChain, Cauldron, mainnet txs) |
| [`https://dorahacks.io/build/51312`](https://dorahacks.io/build/51312) | Primary (DoraHacks Build) | `FoldClaim` competing FoldingCash + SolidCash submission (mainnet live, `solidcash#4`/`#5`, 50+ tests) |
| [`https://dorahacks.io/build/51303`](https://dorahacks.io/build/51303) & [`51440`](https://dorahacks.io/build/51440) | Primary (DoraHacks Builds) | `XO Mecenas` (`Migrate to XO`) & `XO Inheritance Vault` (`Build with XO`) benchmark submissions |
| [`https://dorahacks.io/discussion/1562264`](https://dorahacks.io/discussion/1562264) & [`bitcoincashresearch.org` #2291](https://bitcoincashresearch.org/t/draft-spec-bch-payment-address-from-a-nostr-npub-cashonize-405/2291) | Primary (Specs & Q&A) | Paytaca `30078` vs dedicated kind, `10011` `i`-tag, WizardConnect `OP_RETURN` proof tx workaround |
| [`https://github.com/solidcash/solidcash`](https://github.com/solidcash/solidcash) | Primary (Repo) | SolidCash compiler/SDK, 10,000-byte script limit caveat, unauthenticated `msg.sender` in `direct` mode |
| [`https://stack.xo.cash/blog/2026-08-24-Vision-to-Reality-6-Writing-Templates`](https://stack.xo.cash/blog/2026-08-24-Vision-to-Reality-6-Writing-Templates) | Primary (XO Docs) | XO template structure, CashASM, roles/actions/transactions/scripts authoring guide |
| [`https://cashtokenmarkets.bch-1.org/tokens/0adb865ee9cc3038de87fba682e6cd361414edc9acff0da2fd0690d75341c640`](https://cashtokenmarkets.bch-1.org/tokens/0adb865ee9cc3038de87fba682e6cd361414edc9acff0da2fd0690d75341c640) | Primary (Market Data) | `FLDCH` price (`$0.000004`), market cap (`$727.97`), TVL (`$1.33K`), volume (`$18.32`) |
| [`https://paryonusd.com/`](https://paryonusd.com/) | Primary (Sponsor) | Official `PUSD` CashToken Category ID (`2469acc5afa4b10cb5b5c04afb89c3a3ffd61c5da9c01e26d00951cae2a02544`) |
