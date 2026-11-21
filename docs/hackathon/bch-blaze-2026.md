# BCH BLAZE 2026 — Hackathon Reference & Playbook

**Event:** BCH BLAZE 2026 (DoraHacks)  
**Primary URLs:**
- DoraHacks: https://dorahacks.io/hackathon/bchblaze2026/detail
- Portal & Live/TokenHunt: https://bchblaze.cash/
- Telegram (mandatory check-in): https://t.me/bchblaze
- Widget Factory Slides Template: https://docs.google.com/presentation/d/1Yfuk9CJkf4U9M_WukcELhumWgj3Ak6345Ewy8hSp-Hk/edit?usp=sharing
- YouTube Playlist: https://www.youtube.com/playlist?list=PLLJp0kjyzzjE

---

## 1. Timeline & Deadlines

| Milestone | Date / Time | WIB (UTC+7) |
| :--- | :--- | :--- |
| Pre-registration | 2026-10-10 – 2026-11-13 | — |
| Hacking & Submission Period | 2026-11-14 – 2026-11-22 | — |
| Final Check-In Stream | 2026-11-21 14:00 UTC | 2026-11-21 21:00 WIB |
| **Submission Deadline** | **2026-11-22 06:00 UTC-8 (14:00 UTC)** | **2026-11-22 21:00 WIB** |
| Judging Period | 2026-11-23 – 2026-11-27 | — |
| Winner Announcement & Showcase | 2026-11-28 | — |

---

## 2. Roll Call Policy (Late-Joiner Caveat)

Roll call (WizardConnect check-in during Info Session, Workshops 1–3, or Kick-off Stream) **has closed**, with an official organizer policy:

- **Late entrants can still compete** without roll call, **but are placed in the low-priority judging queue** (reviewed only after high-priority projects, if time permits).
- **Two ways to escape the low-priority queue:**
  1. Build a project compelling enough that **word-of-mouth / social media traction** (X/Twitter, Telegram `@bchblaze`) draws judge attention.
  2. **Join an existing team/project** that already completed roll call.
- **Telegram verification is still required:** confirm your project is real in `@bchblaze`.

---

## 3. Tracks & Prizes ($8,000+ / 25+ BCH Total)

- **Mainnet Track** (1–4 members):
  - 1st Place: `$3,500 PUSD` + BLISS 2027 tickets for whole team
  - 2nd Place: `$1,500 PUSD` + 1 BLISS 2027 ticket
  - 3rd Place: `$750 PUSD` + 1 BLISS 2027 ticket
- **Media Track** (not mutually exclusive with Mainnet Track):
  - `$1,000 PUSD` for best engaging/viral BCH media
- **Community Choice Award:** `$750 PUSD` (most `EMBER2026` CashTokens donated to project address)
- **TokenHunt Completion Pool:** `$250 PUSD` airdropped to completed projects
- **Sponsor Bounties** (check `https://bchblaze.cash/bounties/`): includes XO bounties (8 BCH pool), `$750 PUSD` Stablecoin Bridge bounty, `$500 PUSD` Paytaca bounty, etc.
- *Prizes paid on BCH mainnet in PUSD (ParyonUSD), BCH, or CashTokens.*

---

## 4. Mainnet Track Eligibility Checklist

Every Mainnet Track submission must satisfy all of the following:

- [ ] Registered on DoraHacks and submitted before `2026-11-22 14:00 UTC` (`21:00 WIB`).
- [ ] **Live, usable web demo** that judges can open with one click and experiment with directly.
- [ ] **Real BCH mainnet transaction feature:** anyone (especially judges) can clearly perform at least one useful BCH mainnet transaction through the app.
- [ ] **Wallet integration:** integrates **WizardConnect** or **XO Template** (or both).
- [ ] **Original or significantly improved work** during the hackathon (if pre-existing, must declare and link old repo + pre-hackathon demo).
- [ ] **Top-of-page banner** on the home page containing:
  1. Link to short presentation using the **Widget Factory** template
  2. Link to public **GitHub/GitLab repository**
  3. **CashTokens address (`bitcoincash:z...`)** for `EMBER2026` donations (never use an exchange deposit address!)
- [ ] Confirmed real in the **BCH BLAZE Telegram** (`@bchblaze`).

---

## 5. Judging Criteria & Strategy

**Judges (Mainnet Track):**
- **Elliot Price** (VP at BCH Bull, founder of BCH Alliance)
- **Kallisti** (Lead developer of Selene Wallet)
- **Sayoshi Nakamario** (Creator of FundMe.cash, Helpme.cash, BCH University, Badgers.cash)

**Scoring (3 judges × 4 categories × 10 pts = 120 pts max):**
1. **Innovation & creativity** — Is it new, creative, and exciting for BCH?
2. **Design & usability** — Is the UI slick, intuitive, and frictionless?
3. **Technical strength** — Good use of BCH's monetary properties / scripting (`CashScript`, `CashTokens`, 0-conf), bug-free, scalable, secure?
4. **Business / investment potential** — Can it become a real profitable product?

**Critical Judge Advice (from DoraHacks):**
- Judges typically spend only **a couple of minutes** per submission by default.
- **Simple things that actually work beat complex apps with rough edges.**
- First impression + clear Widget Factory explanation + instant user value without friction are decisive.
- Broken UX, confusing flows, or mockups/scaffolds that don't execute a real mainnet transaction get marked down immediately.

---

## 6. Mainnet Cost & Budget Reference (Indonesia / IDR)

Reference rates checked `2026-11-14`: `1 BCH ≈ Rp 3.686.817` (`~$199.17 USD`), `1 satoshi ≈ Rp 0,037`.

- **Development & Testing (`Chipnet`):** `Rp 0` (free tBCH via `tbch.googol.cash` / `faucet.paytaca.com`).
- **Node / Indexer / Hosting Infra:** `Rp 0` (public Fulcrum Electrum servers, Chaingraph, Vercel/Netlify/CF Pages free tier).
- **On-chain Mainnet Fees:**
  - Simple BCH tx (~225 B @ `1 sat/byte`): `~225–250 sats` (`~Rp 9`)
  - Plain P2PKH dust limit: `546 sats` (`~Rp 20`)
  - CashToken genesis / CashScript interaction (fee + token UTXO dust): `~1,000–2,500 sats` (`~Rp 37–95`)
  - 100 complex mainnet test txs: `~0.002 BCH` (`~Rp 7,400`)
- **Practical Capital Needed (driven by exchange min-buy / min-withdrawal, not gas):**
  - Minimalist: **Rp 50.000** (`~0.005–0.01 BCH` net in wallet)
  - Comfortable / Safe ("anti kurang"): **Rp 100.000 – Rp 150.000** (`~0.02–0.03 BCH` net in wallet), plus extra only if the app parks pre-funded demo liquidity in a public contract/pool.
- **Exchange Withdrawal Rules:**
  - **Pintu:** min buy `Rp 11.000`; network withdrawal fee deducted on send.
  - **Indodax:** min buy `Rp 10.000` (Lite) / `Rp 25.000` (Pro).
  - **Global (Binance / Bybit / OKX):** Binance fee `0.0002 BCH` (min `0.002 BCH`); Bybit fee `0.001 BCH` (min `0.001 BCH`); OKX fee `0.0008 BCH` (min `0.02 BCH`).
  - **Critical:** Always withdraw on the **native `Bitcoin Cash (BCH)`** network — never BEP20/ERC20/Cronos.
