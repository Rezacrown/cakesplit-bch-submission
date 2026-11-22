# BCH BLAZE 2026 — Project Context

- **Hackathon rules, timeline, eligibility, judging, bounties & budget:** Read `docs/hackathon/bch-blaze-2026.md` and `docs/hackathon/bch-blaze-2026-bounties.md` when scoping features, checking requirements, or preparing submission artifacts.
- **Bitcoin Cash & CashScript/XO technical primer:** Read `docs/knowledge/bitcoin-cash-primer.md` and `.agents/skills/bitcoin-cash/SKILL.md` before designing UTXOs, CashScript/XO templates, CashTokens, or WizardConnect/SDK flows.

## Locked Hackathon Targets (BCH BLAZE 2026)

Any new session must treat these three combined targets as the active scope:

1. **Bounty — Build with XO (General Protocols, `0.3 BCH × 10`):** Novel XO template (`@xo-cash` `0.1.0-next.xxx`), reproducible invitations inspectable on `blaze.xo.cash`, follow-up actions, and **~500 words of personally written (non-AI) developer feedback**.
2. **Mainnet Track (`$3,500`/`$1,500`/`$750 PUSD` + BLISS 2027):** Live clickable web app using our **XO Template** (satisfies `"WizardConnect OR XO Template"`), letting judges execute at least 1 real **BCH mainnet** transaction (use minimal recoverable funds per XO bounty guidance; stage on Chipnet first). Requires top-of-page banner (Widget Factory slides link, repo URL, `bitcoincash:z...` `EMBER2026` address) and `@bchblaze` Telegram confirmation.
3. **Media Track (`$1,000 PUSD`):** Original, engaging/viral BCH media (e.g., short demo/explainer video, skit, or visual story tied to our app/BCH) hosted online with the `EMBER2026` `bitcoincash:z...` address in banner/description.
4. **Automatic Side Pools:** **Community Choice (`$750 PUSD`)** and **TokenHunt (`$250 PUSD`)** once Mainnet/Media eligibility is met.
- *Queue note:* Missed Roll Call puts Mainnet/Media in the low-priority queue (escape via compelling social traction or joining a Roll Call team); Build with XO is judged independently across 10 slots.

## Active Project: CakeSplit

- **Concept:** Trustless on-chain group split-bill dApp (`CakeSplit`) backed by a 113-byte P2SH32 **Bill Pot Covenant** XO Template (`openBill`, `chipIn`, `settleBill`, `cancelBill`, zero timelock, supports both XO follow-up invitations and universal any-wallet BIP21 QR scan sweeping).
- **XO Template ID:** `332154d13ae190aff7da5a601aea3f94b8547393ce509c31b01cfde078163e4a` (`@xo-cash/engine@0.1.1-next.18230317763`, artifacts in `artifacts/xo/`, verified on `https://blaze.xo.cash/` — screenshot in `docs/debug-tool/blaze-xo-openBill-inspect.png`).
- **Stack & Architecture:** Next.js `16.4.6` (ESM + Turbopack, `images: { unoptimized: true }`), React `19.3`, Tailwind CSS v4, `shadcn/ui` monochrome neutral rubber-hose ink cartoon aesthetic (zero emojis, 11 alpha-transparent mascot PNGs in `public/mascots/`), 5-layer `structuring-frontend` (< 250 lines/file), TanStack Query v5, Zod v4, Zustand v5, `@xo-cash/*`, `@bitauth/libauth` v3, `@electrum-cash/network` v4, Vitest v5 (`33/33` passing).
- **Network Scope:** **Mainnet-only UI** (`bch.imaginary.cash`, `electrum.imaginary.cash`, `cashnode.bch.ninja`, `fulcrum.greyh.at` WSS port `50004`, live 4s 0-conf polling, pre-flight BCH 2026 VM verification before broadcast, live Coinbase/CoinGecko BCH/USD rate with `USD | BCH` input toggle). Library/tests retain `"mainnet" | "chipnet"` compatibility.
- **Mainnet Wallet (Public):** BCH `bitcoincash:qr4jg99w7eeupyd9hch370t3ffkd8kmmfszwxk6ml2` | CashTokens (`EMBER2026` banner) `bitcoincash:zr4jg99w7eeupyd9hch370t3ffkd8kmmfs9y4g5aqe`.
- **Current Milestone Status:**
  - ✅ `#2` Contract + XO Template + Signed XO Invitations + Utilities (`closed`)
  - ✅ `blaze.xo.cash` live `Import Template` + `Join Invitation` verified (`docs/debug-tool/blaze-xo-openBill-inspect.png`)
  - ✅ `#3` Full 4-page monochrome ink UI (`/`, `/create`, `/bill`, `/xo`) + `USD | BCH` live price toggle + Live Mainnet Electrum/Fulcrum polling & `settleBill`/`cancelBill` broadcast (`closed`, `33/33` tests, `typecheck`/`lint`/`build` PASS)
  - ⏳ `#4` Execute real Mainnet proof tx & archive txids/broadcasted XO invitations, deploy live URL (Vercel) & plug Widget Factory Slides link into `BlazeTopBanner.tsx`, write ~500 words personal (non-AI) XO feedback, create Media Track asset, switch GitHub repo to **Public**, check in on Telegram `@bchblaze` & submit on DoraHacks before `2026-11-22 21:00 WIB`

## Agent skills

### Issue tracker

Issues, specs, and tickets live in GitHub Issues for `Rezacrown/bch-blaze-hackathon` via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage labels separating autonomous agent tasks (`ready-for-agent`) from human handoff tasks (`ready-for-human`, e.g. UI design, mainnet wallet/exchange actions, DoraHacks/Telegram). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (`GLOSSARY.md` and `docs/adr/` at repo root). See `docs/agents/domain.md`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
