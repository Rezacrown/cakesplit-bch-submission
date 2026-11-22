# CakeSplit

**Split the table. Pay the cashier in one tap.**

CakeSplit is a trustless, non-custodial group split-bill web application built natively on **Bitcoin Cash Mainnet** using an **XO Template** (`@xo-cash`) for **BCH BLAZE 2026**.

- **Live App (Mainnet):** https://cakesplit-bch.vercel.app
- **XO Template Identifier:** `332154d13ae190aff7da5a601aea3f94b8547393ce509c31b01cfde078163e4a`
- **XO Debug Tool:** https://blaze.xo.cash/
- **EMBER2026 CashTokens Address:** `bitcoincash:zr4jg99w7eeupyd9hch370t3ffkd8kmmfs9y4g5aqe`
- **Hackathon Targets:** Build with XO Bounty (General Protocols), Mainnet Track, Media Track, Community Choice (`EMBER2026`)

---

## What Is CakeSplit?

When friends eat out or share a group expense, one person usually has to front the entire bill and chase everyone afterward—or collect money in a personal wallet where funds depend on trust.

**CakeSplit removes the trusted collector.**

1. **Create a Table Check (`/create`):** Enter the bill title, the cashier's Bitcoin Cash address (`bitcoincash:q...`), and split the total evenly or by custom slices in **USD** (live spot rate) or **BCH**.
2. **Share One Link or QR (`/bill`):** Every table check deterministically compiles a unique **113-byte P2SH32 Bill Pot Covenant** (`bitcoincash:p...`) encoded into a compact, serverless link—no accounts, no backend database, and no contract deployment gas.
3. **Everyone Chips In from Any BCH Wallet:** Friends scan their slice's **BIP21 Payment QR** inside **Cashonize**, **Paytaca**, or **Selene** (or copy the pot address). Live 0-conf deposits appear in seconds via Fulcrum WSS.
4. **One Tap Pays the Cashier (`settleBill`):** Once the pot reaches 100%, **anyone at the table—or even the cashier, with zero signatures—can tap "Pay Cashier Now"** to sweep all pot UTXOs directly to the locked cashier address in a single transaction.
5. **Anti-Rug Guarantee (`cancelBill`):** If plans change before the pot is full, the host can cancel and refund the pot. Once the pot reaches its full target, **even the host is cryptographically blocked from cancelling**—the funds can only settle to the cashier.

---

## Why Bitcoin Cash + XO Stack?

- **No Contract Deployment Cost:** On Bitcoin Cash's UTXO model, P2SH32 covenants do not require an EVM-style deploy transaction. Each bill immediately has a unique on-chain contract address (`bitcoincash:p...`) the instant it is created.
- **Sub-Cent Fees & 0-Conf UX:** A fixed `500 sats` (~$0.001) settlement fee reserve is automatically distributed across participant slices so the pot pays its own miner fee, and friends watch incoming payments hit the progress bar within seconds via 0-conf mempool detection.
- **Dual-Mode Compatibility:** Supports both **XO Template follow-up invitations** (inspectable on `blaze.xo.cash`) and **universal BIP21 QR payments** from any standard Bitcoin Cash wallet.

---

## Smart Contract Architecture (Bill Pot XO Covenant)

Defined in [`src/lib/xo/cakesplit-template.ts`](src/lib/xo/cakesplit-template.ts) and verified byte-for-byte against `@xo-cash/utils` CashASM in [`src/lib/bch/cakesplit-contract.ts`](src/lib/bch/cakesplit-contract.ts).

| Parameter | Purpose |
| :--- | :--- |
| `billNonce` | Unique 8-byte salt giving every table check its own P2SH32 address |
| `merchantLockingScript` | Exact locking bytecode of the cashier / merchant destination |
| `merchantPayoutSatoshis` | Minimum net satoshis enforced for the cashier on settlement |
| `settlementFeeSatoshis` | Fixed `500 sats` reserve so settlement needs zero extra wallet inputs |
| `organizerPublicKey` | Compressed 33-byte secp256k1 key permitted to cancel **only before full** |

### Covenant Actions (1 Start + 3 Follow-Up Actions)

| Action | Role | Spend Rule Enforced by BCH 2026 VM |
| :--- | :--- | :--- |
| **`openBill`** | `organizer` | Start action: opens the P2SH32 Bill Pot output and generates the shareable check & XO Invitation. |
| **`chipIn`** | `contributor` | **Branch `0` (Permissionless):** `output[0].lockingBytecode == activeInput.utxoBytecode` AND `output[0].value > activeInput.utxoValue`. Funds can only grow inside the same covenant. |
| **`settleBill`** | `settler` | **Branch `1` (Permissionless, 0 Signatures):** `output[0].lockingBytecode == merchantLockingScript` AND `output[0].value >= merchantPayoutSatoshis`. Sweeps 1 or N UTXOs in one transaction. |
| **`cancelBill`** | `organizer` | **Branch `2` (Pre-Full Escape Hatch):** `activeInput.utxoValue < merchantPayoutSatoshis + settlementFeeSatoshis` AND valid Schnorr signature from `organizerPublicKey`. Rejected by the VM once funded. |

All transactions pass a mandatory pre-flight verification against the **official `@bitauth/libauth` BCH 2026 VM** before broadcasting to Mainnet.

---

## Inspecting CakeSplit on `blaze.xo.cash`

Reproducible XO Template and Schnorr-signed Invitation artifacts are committed under [`artifacts/xo/`](artifacts/xo/README.md), and live signed invitations can also be inspected directly inside the app at **`/xo`**.

1. Open **[https://blaze.xo.cash/](https://blaze.xo.cash/)**.
2. Click **Import Template** and paste [`artifacts/xo/cakesplit-template.json`](artifacts/xo/cakesplit-template.json).
3. Click **Join Invitation** and paste any of the 4 signed invitations:
   - `artifacts/xo/invitation-openBill.json`
   - `artifacts/xo/invitation-chipIn.json`
   - `artifacts/xo/invitation-settleBill.json`
   - `artifacts/xo/invitation-cancelBill.json`
4. Verified `blaze.xo.cash` inspection screenshot: [`docs/debug-tool/blaze-xo-openBill-inspect.png`](docs/debug-tool/blaze-xo-openBill-inspect.png).

Regenerate artifacts locally at any time with:

```bash
pnpm xo:artifacts
```

---

## Tech Stack & Project Structure

- **Frontend:** Next.js `16.4.6` (App Router + Turbopack), React `19.3`, Tailwind CSS v4, `shadcn/ui` (monochrome rubber-hose ink aesthetic), TanStack Query v5, Zod v4, Zustand v5
- **Bitcoin Cash & XO:** `@xo-cash/engine@0.1.1-next.18230317763`, `@xo-cash/crypto`, `@xo-cash/types`, `@xo-cash/templates`, `@xo-cash/utils`, `@bitauth/libauth@3.1.0-next.8`, `@electrum-cash/network@4.4.8`
- **Testing:** Vitest v5 (`34` unit, BCH 2026 VM attack-vector, and Schnorr XO Invitation tests)

```text
src/
├── app/                  # Thin Next.js routes (/, /create, /bill, /xo)
├── components/
│   ├── layout/           # AppShell, BlazeTopBanner, SiteHeader, SiteFooter
│   └── ui/               # shadcn/ui primitives
├── hooks/                # Shared React Query hooks (useBchPrice)
├── lib/
│   ├── bch/              # P2SH32 compiler, tx builders, compact v2 URL codec, Fulcrum WSS, QR, keys
│   ├── config/           # Typed environment configuration (env.ts)
│   ├── schemas/          # Zod schemas
│   └── xo/               # CakeSplit XO Template & Schnorr-signed Invitation generator/verifier
├── modules/              # 5-layer feature modules (landing, create-bill, bill-room, xo-inspector)
├── services/client/      # Live Fulcrum Mainnet & BCH/USD spot rate workflows
└── store/                # Zustand client state
```

---

## Environment Configuration (`.env`)

All deployment-specific URLs, banner links, and BCH Mainnet endpoints are centralized in [`src/lib/config/env.ts`](src/lib/config/env.ts) and documented in [`.env.example`](.env.example). Swapping to a custom domain or updating the Slides URL in Vercel requires **zero code changes**.

Copy `.env.example` to `.env.local` for local customization:

```bash
cp .env.example .env.local
```

| Variable | Purpose | Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Canonical public URL for metadata (in the browser, shareable `/bill` links automatically adapt to `window.location.origin` when changing domains) | `https://cakesplit-bch.vercel.app` |
| `NEXT_PUBLIC_APP_NAME` | Application brand name | `CakeSplit` |
| `NEXT_PUBLIC_GITHUB_REPO_URL` | Public repository URL shown in banner and footer | `https://github.com/Rezacrown/bch-blaze-hackathon` |
| `NEXT_PUBLIC_SLIDES_URL` | Public Widget Factory Google Slides share URL (switches top banner button to **Slides** automatically when set) | *(empty — falls back to `/#reel`)* |
| `NEXT_PUBLIC_EMBER_ADDRESS` | CashTokens `bitcoincash:z...` address for `EMBER2026` voting | `bitcoincash:zr4jg99w7eeupyd9hch370t3ffkd8kmmfs9y4g5aqe` |
| `NEXT_PUBLIC_XO_DEBUG_TOOL_URL` | XO Debug Tool base URL | `https://blaze.xo.cash/` |
| `NEXT_PUBLIC_ELECTRUM_MAINNET_SERVERS` | Comma-separated Fulcrum WSS endpoints (`host:port`) | `bch.imaginary.cash:50004,...` |
| `NEXT_PUBLIC_EXPLORER_MAINNET_URL` | Mainnet block explorer base URL | `https://explorer.bch.ninja` |
| `NEXT_PUBLIC_FALLBACK_BCH_USD_PRICE` | Offline fallback BCH/USD rate if spot APIs are unreachable | `200` |

---

## Local Development & Verification

```bash
# Install dependencies
pnpm install

# Start local development server
pnpm dev

# Run full verification suite
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

---

## License

MIT
