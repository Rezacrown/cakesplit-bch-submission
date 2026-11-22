import { describe, expect, it } from "vitest";
import { hexToBin } from "@bitauth/libauth";
import {
  buildCancelBillTransaction,
  buildChipInTransaction,
  buildSettleBillTransaction,
  compileCakeSplitContract,
  organizerKeyFromPrivateHex,
  verifyTransactionWithBchVm,
} from "@/lib/bch";
import {
  CAKESPLIT_TEMPLATE_ID,
  createSignedCakeSplitInvitation,
  verifyCakeSplitInvitation,
} from "@/lib/xo";

const TEST_MNEMONIC =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
const ORGANIZER_PRIV_HEX =
  "1111111111111111111111111111111111111111111111111111111111111111";
const FRIEND_PRIV_HEX =
  "2222222222222222222222222222222222222222222222222222222222222222";
const MERCHANT_CHIPNET_ADDR =
  "bchtest:qpm2qsznhks23z7629mms6s4cwef74vcwvqcw003ap";

const TXID_OPEN = "aa".repeat(32);
const TXID_FRIEND_FUND = "bb".repeat(32);

describe("CakeSplit signed XO Invitations (@xo-cash/crypto + @xo-cash/utils)", () => {
  const organizer = organizerKeyFromPrivateHex(ORGANIZER_PRIV_HEX, "chipnet");
  const friend = organizerKeyFromPrivateHex(FRIEND_PRIV_HEX, "chipnet");

  const contract = compileCakeSplitContract({
    billNonceHex: "cafebabe01020304",
    merchantAddress: MERCHANT_CHIPNET_ADDR,
    merchantPayoutSatoshis: 3_500n,
    organizerPublicKeyHex: organizer.publicKeyHex,
    network: "chipnet",
  });

  it("generates and cryptographically verifies signed openBill invitation (tpub on chipnet)", () => {
    const res = createSignedCakeSplitInvitation({
      contract,
      actionIdentifier: "openBill",
      mnemonic: TEST_MNEMONIC,
      initialDepositSatoshis: 1_500n,
      memo: "CakeSplit dinner bill — Host initial share",
    });

    expect(res.templateIdentifier).toBe(CAKESPLIT_TEMPLATE_ID);
    expect(res.entityIdentifier.startsWith("tpub")).toBe(true);

    const check = verifyCakeSplitInvitation(res.serializedJson);
    expect(check.valid).toBe(true);
    expect(check.invitation?.actionIdentifier).toBe("openBill");
    expect(check.invitation?.commits[0].data.outputs?.[0].valueSatoshis).toBe(1_500n);
  });

  it("uses xpub entity identifiers on BCH Mainnet (BIP43 m/2415' separation)", () => {
    const mainnetOrg = organizerKeyFromPrivateHex(ORGANIZER_PRIV_HEX, "mainnet");
    const mainnetContract = compileCakeSplitContract({
      billNonceHex: "cafebabe01020304",
      merchantAddress: "bitcoincash:qr4jg99w7eeupyd9hch370t3ffkd8kmmfszwxk6ml2",
      merchantPayoutSatoshis: 3_500n,
      organizerPublicKeyHex: mainnetOrg.publicKeyHex,
      network: "mainnet",
    });

    const res = createSignedCakeSplitInvitation({
      contract: mainnetContract,
      actionIdentifier: "openBill",
      mnemonic: TEST_MNEMONIC,
      initialDepositSatoshis: 1_500n,
    });

    expect(res.entityIdentifier.startsWith("xpub")).toBe(true);
    expect(verifyCakeSplitInvitation(res.serializedJson).valid).toBe(true);
  });

  it("generates verified follow-up invitations for chipIn, settleBill, and cancelBill with signed tx results", () => {
    // 1. chipIn tx verified on BCH 2026 VM
    const chipInTx = buildChipInTransaction({
      contract,
      potUtxo: { txid: TXID_OPEN, vout: 0, satoshis: 1_500n },
      contributorUtxo: { txid: TXID_FRIEND_FUND, vout: 0, satoshis: 10_000n },
      contributorPrivateKey: hexToBin(friend.privateKeyHex),
      contributionSatoshis: 2_500n,
    });
    expect(verifyTransactionWithBchVm(chipInTx.transaction, chipInTx.sourceOutputs)).toEqual({
      ok: true,
    });

    const chipInInv = createSignedCakeSplitInvitation({
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
      broadcasted: true,
    });
    expect(verifyCakeSplitInvitation(chipInInv.serializedJson).valid).toBe(true);

    // 2. settleBill tx verified on BCH 2026 VM
    const settleTx = buildSettleBillTransaction({
      contract,
      potUtxos: [{ txid: chipInTx.txid, vout: 0, satoshis: 4_000n }],
    });
    expect(verifyTransactionWithBchVm(settleTx.transaction, settleTx.sourceOutputs)).toEqual({
      ok: true,
    });

    const settleInv = createSignedCakeSplitInvitation({
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
      broadcasted: true,
    });
    expect(verifyCakeSplitInvitation(settleInv.serializedJson).valid).toBe(true);

    // 3. cancelBill tx verified on BCH 2026 VM
    const cancelTx = buildCancelBillTransaction({
      contract,
      potUtxos: [{ txid: TXID_OPEN, vout: 0, satoshis: 1_500n }],
      organizerPrivateKey: hexToBin(organizer.privateKeyHex),
      refundAddress: organizer.address,
    });
    expect(verifyTransactionWithBchVm(cancelTx.transaction, cancelTx.sourceOutputs)).toEqual({
      ok: true,
    });

    const cancelInv = createSignedCakeSplitInvitation({
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
    });
    expect(verifyCakeSplitInvitation(cancelInv.serializedJson).valid).toBe(true);
  });

  it("rejects tampered XO invitation commit data (Schnorr verification fails)", () => {
    const res = createSignedCakeSplitInvitation({
      contract,
      actionIdentifier: "settleBill",
      mnemonic: TEST_MNEMONIC,
      currentPotSatoshis: 4_000n,
    });

    // Tamper with a committed value after signing
    const tampered = structuredClone(res.invitation);
    tampered.commits[0].data.outputs![0].valueSatoshis = 9_999n;

    const check = verifyCakeSplitInvitation(tampered);
    expect(check.valid).toBe(false);
    expect(check.error).toContain("Invalid Schnorr signature");
  });

  it("cryptographically verifies the archived live BCH Mainnet broadcasted settleBill XO invitation", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const raw = fs
      .readFileSync(
        path.resolve("artifacts/xo/mainnet-settleBill-invitation.json"),
        "utf8",
      )
      .trim();

    const check = verifyCakeSplitInvitation(raw);
    expect(check.valid).toBe(true);
    expect(check.invitation?.commits).toHaveLength(1);
    expect(check.invitation?.templateIdentifier).toBe(CAKESPLIT_TEMPLATE_ID);
    expect(check.invitation?.actionIdentifier).toBe("settleBill");
    expect(
      check.invitation?.result?.transactions?.settleBillTransaction?.transactionHash,
    ).toBe("8729bb2c7cf880a7496e662233aa21612dabafefe20772f82c8ae39aecefb6ff");
  });
});
