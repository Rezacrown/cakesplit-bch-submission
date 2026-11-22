import { describe, expect, it } from "vitest";
import { hexToBin, type TransactionBch } from "@bitauth/libauth";
import {
  buildCancelBillTransaction,
  buildChipInTransaction,
  buildSettleBillTransaction,
  cashAddressToLockingHex,
  compileCakeSplitContract,
  generateOrganizerKey,
  organizerKeyFromPrivateHex,
  verifyTransactionWithBchVm,
} from "@/lib/bch";
import {
  buildCakeSplitActionBundle,
  CAKESPLIT_SETTLEMENT_FEE_SATS,
  CAKESPLIT_TEMPLATE_ID,
  cakeSplitTemplate,
  compileBillPotViaXoCashAsm,
  serializeCakeSplitTemplate,
} from "@/lib/xo";

const ORGANIZER_PRIV_HEX =
  "1111111111111111111111111111111111111111111111111111111111111111";
const FRIEND_PRIV_HEX =
  "2222222222222222222222222222222222222222222222222222222222222222";
const ATTACKER_PRIV_HEX =
  "3333333333333333333333333333333333333333333333333333333333333333";

const MERCHANT_CHIPNET_ADDR =
  "bchtest:qpm2qsznhks23z7629mms6s4cwef74vcwvqcw003ap";

const TXID_A = "aa".repeat(32);
const TXID_B = "bb".repeat(32);
const TXID_C = "cc".repeat(32);
const TXID_FUND = "dd".repeat(32);

describe("CakeSplit XO Template & BCH 2026 VM Covenant", () => {
  const organizer = organizerKeyFromPrivateHex(ORGANIZER_PRIV_HEX, "chipnet");
  const friend = organizerKeyFromPrivateHex(FRIEND_PRIV_HEX, "chipnet");
  const attacker = organizerKeyFromPrivateHex(ATTACKER_PRIV_HEX, "chipnet");

  const contract = compileCakeSplitContract({
    billNonceHex: "cafebabe01020304",
    merchantAddress: MERCHANT_CHIPNET_ADDR,
    merchantPayoutSatoshis: 3_500n,
    organizerPublicKeyHex: organizer.publicKeyHex,
    network: "chipnet",
  });

  it("validates CakeSplit XO template schema, template ID, and follow-up actions", () => {
    expect(CAKESPLIT_TEMPLATE_ID).toMatch(/^[0-9a-f]{64}$/);
    expect(cakeSplitTemplate.lockingScripts.billPotLockingScript.lockingType).toBe("p2sh");
    expect(Object.keys(cakeSplitTemplate.actions)).toEqual([
      "openBill",
      "chipIn",
      "settleBill",
      "cancelBill",
    ]);
    expect(cakeSplitTemplate.lockingScripts.billPotLockingScript.actions?.length).toBe(2);
    expect(
      cakeSplitTemplate.lockingScripts.billPotLockingScript.roles?.organizer.actions?.length,
    ).toBe(3);

    const serialized = serializeCakeSplitTemplate();
    expect(serialized).toContain("CakeSplit");
    expect(contract.potGoalSatoshis).toBe(3_500n + CAKESPLIT_SETTLEMENT_FEE_SATS);
    expect(contract.contractAddress.startsWith("bchtest:p")).toBe(true);
  });

  it("matches @xo-cash/utils CashASM compiler byte-for-byte", () => {
    const viaXo = compileBillPotViaXoCashAsm({
      billNonceHex: contract.billNonceHex,
      merchantLockingHex: contract.merchantLockingHex,
      merchantPayoutSatoshis: contract.merchantPayoutSatoshis,
      organizerPublicKeyHex: contract.organizerPublicKeyHex,
    });

    expect(viaXo.redeemBytecodeHex).toBe(contract.redeemBytecodeHex);
    expect(viaXo.lockingBytecodeHex).toBe(contract.lockingBytecodeHex);
  });

  it("produces distinct P2SH32 contract addresses for different bill nonces", () => {
    const other = compileCakeSplitContract({
      billNonceHex: "deadbeef01020304",
      merchantAddress: MERCHANT_CHIPNET_ADDR,
      merchantPayoutSatoshis: 3_500n,
      organizerPublicKeyHex: organizer.publicKeyHex,
      network: "chipnet",
    });
    expect(other.contractAddress).not.toBe(contract.contractAddress);
  });

  it("PASSES BCH 2026 VM on chipIn happy path (pot balance increases, covenant preserved)", () => {
    const built = buildChipInTransaction({
      contract,
      potUtxo: { txid: TXID_A, vout: 0, satoshis: 1_500n },
      contributorUtxo: { txid: TXID_FUND, vout: 0, satoshis: 10_000n },
      contributorPrivateKey: hexToBin(friend.privateKeyHex),
      contributionSatoshis: 2_500n,
    });

    expect(built.newPotSatoshis).toBe(4_000n);
    expect(built.changeSatoshis).toBeGreaterThan(0n);

    const vmRes = verifyTransactionWithBchVm(built.transaction, built.sourceOutputs);
    expect(vmRes).toEqual({ ok: true });
  });

  it("REJECTS chipIn attack if output 0 diverts to attacker address", () => {
    const built = buildChipInTransaction({
      contract,
      potUtxo: { txid: TXID_A, vout: 0, satoshis: 1_500n },
      contributorUtxo: { txid: TXID_FUND, vout: 0, satoshis: 10_000n },
      contributorPrivateKey: hexToBin(friend.privateKeyHex),
      contributionSatoshis: 2_500n,
    });

    const tamperedTx: TransactionBch = {
      ...built.transaction,
      outputs: [
        {
          lockingBytecode: hexToBin(cashAddressToLockingHex(attacker.address)),
          valueSatoshis: 4_000n,
        },
        ...built.transaction.outputs.slice(1),
      ],
    };

    const vmRes = verifyTransactionWithBchVm(tamperedTx, built.sourceOutputs);
    expect(vmRes.ok).toBe(false);
  });

  it("REJECTS chipIn attack if output 0 reduces or keeps equal pot balance", () => {
    const built = buildChipInTransaction({
      contract,
      potUtxo: { txid: TXID_A, vout: 0, satoshis: 1_500n },
      contributorUtxo: { txid: TXID_FUND, vout: 0, satoshis: 10_000n },
      contributorPrivateKey: hexToBin(friend.privateKeyHex),
      contributionSatoshis: 2_500n,
    });

    for (const badValue of [1_499n, 1_500n]) {
      const tamperedTx: TransactionBch = {
        ...built.transaction,
        outputs: [
          {
            lockingBytecode: contract.lockingBytecode,
            valueSatoshis: badValue,
          },
          ...built.transaction.outputs.slice(1),
        ],
      };
      const vmRes = verifyTransactionWithBchVm(tamperedTx, built.sourceOutputs);
      expect(vmRes.ok).toBe(false);
    }
  });

  it("PASSES BCH 2026 VM on permissionless settleBill (single UTXO, 0 signatures)", () => {
    const built = buildSettleBillTransaction({
      contract,
      potUtxos: [{ txid: TXID_A, vout: 0, satoshis: 4_000n }],
    });

    expect(built.merchantPaidSatoshis).toBe(3_500n);
    expect(built.sweptUtxoCount).toBe(1);

    const vmRes = verifyTransactionWithBchVm(built.transaction, built.sourceOutputs);
    expect(vmRes).toEqual({ ok: true });
  });

  it("PASSES BCH 2026 VM on multi-UTXO QR scan settleBill sweep (3 friends -> 1 merchant tx)", () => {
    const built = buildSettleBillTransaction({
      contract,
      potUtxos: [
        { txid: TXID_A, vout: 0, satoshis: 1_500n },
        { txid: TXID_B, vout: 1, satoshis: 1_500n },
        { txid: TXID_C, vout: 0, satoshis: 1_500n },
      ],
    });

    expect(built.sweptUtxoCount).toBe(3);
    expect(built.merchantPaidSatoshis).toBeGreaterThanOrEqual(3_500n);

    const vmRes = verifyTransactionWithBchVm(built.transaction, built.sourceOutputs);
    expect(vmRes).toEqual({ ok: true });
  });

  it("REJECTS settleBill attack if payout is diverted to wrong address", () => {
    const built = buildSettleBillTransaction({
      contract,
      potUtxos: [{ txid: TXID_A, vout: 0, satoshis: 4_000n }],
    });

    const tamperedTx: TransactionBch = {
      ...built.transaction,
      outputs: [
        {
          lockingBytecode: hexToBin(cashAddressToLockingHex(attacker.address)),
          valueSatoshis: 3_500n,
        },
      ],
    };

    const vmRes = verifyTransactionWithBchVm(tamperedTx, built.sourceOutputs);
    expect(vmRes.ok).toBe(false);
  });

  it("REJECTS settleBill attack if merchant is underpaid by even 1 satoshi", () => {
    const built = buildSettleBillTransaction({
      contract,
      potUtxos: [{ txid: TXID_A, vout: 0, satoshis: 4_000n }],
    });

    const tamperedTx: TransactionBch = {
      ...built.transaction,
      outputs: [
        {
          lockingBytecode: contract.merchantLockingBytecode,
          valueSatoshis: 3_499n,
        },
      ],
    };

    const vmRes = verifyTransactionWithBchVm(tamperedTx, built.sourceOutputs);
    expect(vmRes.ok).toBe(false);
  });

  it("PASSES BCH 2026 VM on organizer cancelBill while pot is below full goal", () => {
    const built = buildCancelBillTransaction({
      contract,
      potUtxos: [{ txid: TXID_A, vout: 0, satoshis: 2_500n }],
      organizerPrivateKey: hexToBin(organizer.privateKeyHex),
      refundAddress: organizer.address,
    });

    expect(built.refundedSatoshis).toBeGreaterThan(2_000n);
    const vmRes = verifyTransactionWithBchVm(built.transaction, built.sourceOutputs);
    expect(vmRes).toEqual({ ok: true });
  });

  it("REJECTS cancelBill if organizer tries to cancel AFTER pot reaches full goal (anti-rug!)", () => {
    const built = buildCancelBillTransaction({
      contract,
      potUtxos: [{ txid: TXID_A, vout: 0, satoshis: 4_000n }],
      organizerPrivateKey: hexToBin(organizer.privateKeyHex),
      refundAddress: organizer.address,
    });

    const vmRes = verifyTransactionWithBchVm(built.transaction, built.sourceOutputs);
    expect(vmRes.ok).toBe(false);
  });

  it("REJECTS cancelBill if non-organizer / attacker signs the cancel transaction", () => {
    const built = buildCancelBillTransaction({
      contract,
      potUtxos: [{ txid: TXID_A, vout: 0, satoshis: 2_500n }],
      organizerPrivateKey: hexToBin(attacker.privateKeyHex),
      refundAddress: attacker.address,
    });

    const vmRes = verifyTransactionWithBchVm(built.transaction, built.sourceOutputs);
    expect(vmRes.ok).toBe(false);
  });

  it("builds valid XO action bundles for blaze.xo.cash inspection", () => {
    const freshKey = generateOrganizerKey("mainnet");
    expect(freshKey.publicKeyHex).toHaveLength(66);

    const bundle = buildCakeSplitActionBundle({
      contract,
      actionIdentifier: "settleBill",
      currentPotSatoshis: 4_000n,
    });
    expect(bundle.templateIdentifier).toBe(CAKESPLIT_TEMPLATE_ID);
    expect(bundle.actionIdentifier).toBe("settleBill");
    expect(bundle.contractAddress).toBe(contract.contractAddress);
  });

  it("serializes asymmetric display-order txids into valid wire little-endian outpoint hashes", () => {
    const asymmetricTxid =
      "0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20";
    const expectedWireHex =
      "201f1e1d1c1b1a191817161514131211100f0e0d0c0b0a090807060504030201";

    const builtSettle = buildSettleBillTransaction({
      contract,
      potUtxos: [{ txid: asymmetricTxid, vout: 0, satoshis: 4_000n }],
    });
    // Raw BCH tx layout: 4-byte version (8 hex) + 1-byte input count (2 hex) + 32-byte outpoint hash (64 hex)
    expect(builtSettle.rawTxHex.slice(10, 74)).toBe(expectedWireHex);
    expect(
      verifyTransactionWithBchVm(builtSettle.transaction, builtSettle.sourceOutputs),
    ).toEqual({ ok: true });

    const builtCancel = buildCancelBillTransaction({
      contract,
      potUtxos: [{ txid: asymmetricTxid, vout: 0, satoshis: 2_500n }],
      organizerPrivateKey: hexToBin(organizer.privateKeyHex),
      refundAddress: organizer.address,
    });
    expect(builtCancel.rawTxHex.slice(10, 74)).toBe(expectedWireHex);
    expect(
      verifyTransactionWithBchVm(builtCancel.transaction, builtCancel.sourceOutputs),
    ).toEqual({ ok: true });
  });

  it("classifies on-chain pot history txs into settled, cancelled, or deposit", async () => {
    const { classifyPotResolutionTx } = await import("@/lib/bch");

    const builtChipIn = buildChipInTransaction({
      contract,
      potUtxo: { txid: TXID_A, vout: 0, satoshis: 1_500n },
      contributorUtxo: { txid: TXID_FUND, vout: 0, satoshis: 10_000n },
      contributorPrivateKey: hexToBin(friend.privateKeyHex),
      contributionSatoshis: 2_500n,
    });
    expect(
      classifyPotResolutionTx(contract, builtChipIn.rawTxHex, {
        txid: builtChipIn.txid,
        height: 900_000,
        isUnconfirmed: false,
      }),
    ).toBeNull();

    const builtSettle = buildSettleBillTransaction({
      contract,
      potUtxos: [{ txid: TXID_A, vout: 0, satoshis: 4_000n }],
    });
    const settled = classifyPotResolutionTx(contract, builtSettle.rawTxHex, {
      txid: builtSettle.txid,
      height: 900_001,
      isUnconfirmed: false,
    });
    expect(settled?.kind).toBe("settled");
    expect(settled?.outputSatoshis).toBe(3_500n);

    const builtCancel = buildCancelBillTransaction({
      contract,
      potUtxos: [{ txid: TXID_A, vout: 0, satoshis: 2_500n }],
      organizerPrivateKey: hexToBin(organizer.privateKeyHex),
      refundAddress: organizer.address,
    });
    const cancelled = classifyPotResolutionTx(contract, builtCancel.rawTxHex, {
      txid: builtCancel.txid,
      height: 900_002,
      isUnconfirmed: false,
    });
    expect(cancelled?.kind).toBe("cancelled");
    expect(cancelled?.outputSatoshis).toBe(builtCancel.refundedSatoshis);
  });
});
