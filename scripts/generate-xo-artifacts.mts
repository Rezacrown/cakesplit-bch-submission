import fs from "node:fs";
import path from "node:path";
import { hexToBin } from "@bitauth/libauth";
import {
  buildCancelBillTransaction,
  buildChipInTransaction,
  buildSettleBillTransaction,
  compileCakeSplitContract,
  organizerKeyFromPrivateHex,
  verifyTransactionWithBchVm,
} from "../src/lib/bch";
import {
  CAKESPLIT_TEMPLATE_ID,
  compileBillPotViaXoCashAsm,
  createSignedCakeSplitInvitation,
  serializeCakeSplitTemplate,
  verifyCakeSplitInvitation,
} from "../src/lib/xo";

const ARTIFACTS_DIR = path.resolve(import.meta.dirname, "../artifacts/xo");

// Deterministic sample keys for reproducible Chipnet inspection artifacts (NEVER use with real Mainnet funds!)
const SAMPLE_MNEMONIC =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
const SAMPLE_ORGANIZER_PRIV_HEX =
  "1111111111111111111111111111111111111111111111111111111111111111";
const SAMPLE_FRIEND_PRIV_HEX =
  "2222222222222222222222222222222222222222222222222222222222222222";
const SAMPLE_MERCHANT_CHIPNET =
  "bchtest:qpm2qsznhks23z7629mms6s4cwef74vcwvqcw003ap";

const SAMPLE_OPEN_TXID = "10".repeat(32);
const SAMPLE_FRIEND_FUND_TXID = "20".repeat(32);

function main() {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

  const organizer = organizerKeyFromPrivateHex(SAMPLE_ORGANIZER_PRIV_HEX, "chipnet");
  const friend = organizerKeyFromPrivateHex(SAMPLE_FRIEND_PRIV_HEX, "chipnet");

  const contract = compileCakeSplitContract({
    billNonceHex: "cafebabe01020304",
    merchantAddress: SAMPLE_MERCHANT_CHIPNET,
    merchantPayoutSatoshis: 3_500n,
    organizerPublicKeyHex: organizer.publicKeyHex,
    network: "chipnet",
  });

  // 1. Verify exact CashASM parity with @xo-cash/utils compiler
  const viaXo = compileBillPotViaXoCashAsm({
    billNonceHex: contract.billNonceHex,
    merchantLockingHex: contract.merchantLockingHex,
    merchantPayoutSatoshis: contract.merchantPayoutSatoshis,
    organizerPublicKeyHex: contract.organizerPublicKeyHex,
  });
  if (viaXo.lockingBytecodeHex !== contract.lockingBytecodeHex) {
    throw new Error("Bytecode mismatch between CakeSplit compiler and @xo-cash/utils!");
  }

  // 2. Write canonical CakeSplit XO Template Extended JSON
  const templateJson = serializeCakeSplitTemplate();
  fs.writeFileSync(path.join(ARTIFACTS_DIR, "cakesplit-template.json"), `${templateJson}\n`);

  // 3. Build & VM-verify transactions for follow-up actions
  const chipInTx = buildChipInTransaction({
    contract,
    potUtxo: { txid: SAMPLE_OPEN_TXID, vout: 0, satoshis: 1_500n },
    contributorUtxo: { txid: SAMPLE_FRIEND_FUND_TXID, vout: 0, satoshis: 10_000n },
    contributorPrivateKey: hexToBin(friend.privateKeyHex),
    contributionSatoshis: 2_500n,
  });
  const chipInVm = verifyTransactionWithBchVm(chipInTx.transaction, chipInTx.sourceOutputs);
  if (!chipInVm.ok) throw new Error(`chipIn VM failed: ${chipInVm.error}`);

  const settleTx = buildSettleBillTransaction({
    contract,
    potUtxos: [{ txid: chipInTx.txid, vout: 0, satoshis: 4_000n }],
  });
  const settleVm = verifyTransactionWithBchVm(settleTx.transaction, settleTx.sourceOutputs);
  if (!settleVm.ok) throw new Error(`settleBill VM failed: ${settleVm.error}`);

  const cancelTx = buildCancelBillTransaction({
    contract,
    potUtxos: [{ txid: SAMPLE_OPEN_TXID, vout: 0, satoshis: 1_500n }],
    organizerPrivateKey: hexToBin(organizer.privateKeyHex),
    refundAddress: organizer.address,
  });
  const cancelVm = verifyTransactionWithBchVm(cancelTx.transaction, cancelTx.sourceOutputs);
  if (!cancelVm.ok) throw new Error(`cancelBill VM failed: ${cancelVm.error}`);

  // 4. Generate & verify signed XO Invitations for all 4 actions
  const invitations = {
    openBill: createSignedCakeSplitInvitation({
      contract,
      actionIdentifier: "openBill",
      mnemonic: SAMPLE_MNEMONIC,
      initialDepositSatoshis: 1_500n,
      memo: "CakeSplit: Open dinner split bill (3,500 sats payout + 500 sats settlement fee buffer)",
    }),
    chipIn: createSignedCakeSplitInvitation({
      contract,
      actionIdentifier: "chipIn",
      privateKeyHex: friend.privateKeyHex,
      currentPotSatoshis: 1_500n,
      contributionSatoshis: 2_500n,
      inputs: [
        {
          inputIdentifier: "chipInPotInput",
          transactionIndex: 0,
          outpointIndex: 0,
          outpointTransactionHash: chipInTx.transaction.inputs[0].outpointTransactionHash,
          unlockingBytecode: chipInTx.transaction.inputs[0].unlockingBytecode,
          sequenceNumber: 0xffffffff,
        },
      ],
      transactionHash: chipInTx.txid,
      broadcasted: false,
      memo: "CakeSplit follow-up #1: Friend chips in 2,500 sats to reach 4,000 sats goal",
    }),
    settleBill: createSignedCakeSplitInvitation({
      contract,
      actionIdentifier: "settleBill",
      privateKeyHex: friend.privateKeyHex,
      currentPotSatoshis: 4_000n,
      inputs: [
        {
          inputIdentifier: "settlePotInput",
          transactionIndex: 0,
          outpointIndex: 0,
          outpointTransactionHash: settleTx.transaction.inputs[0].outpointTransactionHash,
          unlockingBytecode: settleTx.transaction.inputs[0].unlockingBytecode,
          sequenceNumber: 0xffffffff,
        },
      ],
      transactionHash: settleTx.txid,
      broadcasted: false,
      memo: "CakeSplit follow-up #2: Permissionless 0-signature settlement to merchant",
    }),
    cancelBill: createSignedCakeSplitInvitation({
      contract,
      actionIdentifier: "cancelBill",
      privateKeyHex: organizer.privateKeyHex,
      currentPotSatoshis: 1_500n,
      refundLockingHex: contract.merchantLockingHex,
      inputs: [
        {
          inputIdentifier: "cancelPotInput",
          transactionIndex: 0,
          outpointIndex: 0,
          outpointTransactionHash: cancelTx.transaction.inputs[0].outpointTransactionHash,
          unlockingBytecode: cancelTx.transaction.inputs[0].unlockingBytecode,
          sequenceNumber: 0xffffffff,
        },
      ],
      transactionHash: cancelTx.txid,
      broadcasted: false,
      memo: "CakeSplit follow-up #3: Organizer cancels incomplete pot (< 4,000 sats)",
    }),
  };

  for (const [actionName, item] of Object.entries(invitations)) {
    const verification = verifyCakeSplitInvitation(item.serializedJson);
    if (!verification.valid) {
      throw new Error(`Invitation ${actionName} failed verification: ${verification.error}`);
    }
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, `invitation-${actionName}.json`),
      `${item.serializedJson}\n`,
    );
  }

  const readme = `# CakeSplit XO Template & Invitation Artifacts

Generated reproducibly via \`pnpm xo:artifacts\` for inspection on **[https://blaze.xo.cash/](https://blaze.xo.cash/)**.

## Summary
- **Template Identifier:** \`${CAKESPLIT_TEMPLATE_ID}\`
- **Sample Chipnet Contract Address (P2SH32):** \`${contract.contractAddress}\`
- **Locking Bytecode (hex):** \`${contract.lockingBytecodeHex}\`
- **Redeem Bytecode (${contract.redeemBytecode.length} bytes):** \`${contract.redeemBytecodeHex}\`

## Files
1. \`cakesplit-template.json\` — Canonical CakeSplit XO Template Extended JSON (validated by \`@xo-cash/utils\` \`parseTemplate\`).
2. \`invitation-openBill.json\` — Signed \`openBill\` start invitation.
3. \`invitation-chipIn.json\` — Signed \`chipIn\` follow-up action invitation (BCH 2026 VM verified).
4. \`invitation-settleBill.json\` — Signed \`settleBill\` permissionless follow-up invitation (0 signatures, BCH 2026 VM verified).
5. \`invitation-cancelBill.json\` — Signed \`cancelBill\` organizer escape-hatch follow-up invitation (only valid before pot reaches goal, BCH 2026 VM verified).

## How to Inspect on blaze.xo.cash
1. Open **https://blaze.xo.cash/**.
2. Import \`cakesplit-template.json\` in the Template Inspector.
3. Paste any \`invitation-*.json\` file into the Invitation Inspector to inspect roles, commits, Schnorr signatures, variables, and follow-up actions.
4. Re-generate locally at any time with:
   \`\`\`bash
   pnpm xo:artifacts
   pnpm test
   \`\`\`
`;
  fs.writeFileSync(path.join(ARTIFACTS_DIR, "README.md"), readme);

  console.log("Generated CakeSplit XO artifacts in:", ARTIFACTS_DIR);
  console.log("Template ID:", CAKESPLIT_TEMPLATE_ID);
  console.log("Contract Address (Chipnet P2SH32):", contract.contractAddress);
  console.log("Redeem script size:", contract.redeemBytecode.length, "bytes");
}

main();
