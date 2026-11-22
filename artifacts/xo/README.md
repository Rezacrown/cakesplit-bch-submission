# CakeSplit XO Template & Invitation Artifacts

Generated reproducibly via `pnpm xo:artifacts` for inspection on **[https://blaze.xo.cash/](https://blaze.xo.cash/)**.

## Summary
- **Template Identifier:** `c52aac6dcb3a27a8d2f915f1c20fbf806548041e2ea88f6abc6fcca9cd8f4755`
- **Sample Chipnet Contract Address (P2SH32):** `bchtest:pw6u9atdxtz04pmazntghhznvrcve3jc4gjatzumj6m92expfe35g046j8nzl`
- **Locking Bytecode (hex):** `aa20b5c2f56d32c4fa877d14d68bdc5360f0ccc658aa25d58b9b96b65564c14e634487`
- **Redeem Bytecode (113 bytes):** `08cafebabe010203047576009c637500cdc0c78800ccc0c6a067519c6300cd1976a91476a04053bda0a88bda5177b86a15c3b29f55987388ac8800cc02ac0da267c0c602ac0d02f401939f6921034f355bdcb7cc0af728ef3cceb9615d90684bb5b2ca5f859ab0f0b704075871aaac6868`

## Files
1. `cakesplit-template.json` — Canonical CakeSplit XO Template Extended JSON (validated by `@xo-cash/utils` `parseTemplate`).
2. `invitation-openBill.json` — Signed `openBill` start invitation.
3. `invitation-chipIn.json` — Signed `chipIn` follow-up action invitation (BCH 2026 VM verified).
4. `invitation-settleBill.json` — Signed `settleBill` permissionless follow-up invitation (0 signatures, BCH 2026 VM verified).
5. `invitation-cancelBill.json` — Signed `cancelBill` organizer escape-hatch follow-up invitation (only valid before pot reaches goal, BCH 2026 VM verified).
6. **`mainnet-settleBill-invitation.json`** — Live **BCH Mainnet** Schnorr-signed broadcasted `settleBill` XO Invitation referencing real Mainnet tx [`8729bb2c7cf880a7496e662233aa21612dabafefe20772f82c8ae39aecefb6ff`](https://explorer.bch.ninja/tx/8729bb2c7cf880a7496e662233aa21612dabafefe20772f82c8ae39aecefb6ff) (`10,000 sats` net to cashier, `500 sats` fee).

## How to Inspect on blaze.xo.cash
1. Open **https://blaze.xo.cash/**.
2. Import `cakesplit-template.json` in the Template Inspector.
3. Paste any `invitation-*.json` file into the Invitation Inspector to inspect roles, commits, Schnorr signatures, variables, and follow-up actions.
4. Re-generate locally at any time with:
   ```bash
   pnpm xo:artifacts
   pnpm test
   ```
