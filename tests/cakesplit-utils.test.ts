import { describe, expect, it } from "vitest";
import {
  buildShareableBillUrl,
  calculateBillSummary,
  computePayableSlices,
  computePotProgress,
  decodeShareableBill,
  encodeShareableBill,
  exportOrganizerKeyWif,
  generateOrganizerKey,
  generatePaymentQrDataUrl,
  generateRandomBillNonceHex,
  generateUrlQrDataUrl,
  getExplorerAddressUrl,
  getExplorerTxUrl,
  importOrganizerKeyWif,
  splitEvenly,
} from "@/lib/bch";

const MERCHANT_MAINNET =
  "bitcoincash:qr4jg99w7eeupyd9hch370t3ffkd8kmmfszwxk6ml2";

describe("CakeSplit frontend utilities", () => {
  it("splits satoshis evenly without losing remainders", () => {
    const shares = splitEvenly(10_000, ["Alice", "Bob", "Charlie"]);
    expect(shares.map((s) => s.shareSatoshis)).toEqual([3334, 3333, 3333]);
    expect(shares.reduce((sum, s) => sum + s.shareSatoshis, 0)).toBe(10_000);
  });

  it("calculates bill summary with and without fee buffer on top", () => {
    const participants = splitEvenly(3_500, ["Host", "Friend"]);
    const onTop = calculateBillSummary({ participants, addFeeOnTop: true });
    expect(onTop.merchantPayoutSatoshis).toBe(3_500n);
    expect(onTop.settlementFeeSatoshis).toBe(500n);
    expect(onTop.potGoalSatoshis).toBe(4_000n);

    const included = calculateBillSummary({ participants, addFeeOnTop: false });
    expect(included.merchantPayoutSatoshis).toBe(3_000n);
    expect(included.potGoalSatoshis).toBe(3_500n);
  });

  it("computes pot progress and unlockable actions accurately", () => {
    expect(computePotProgress(0n, 4_000n)).toEqual({
      collectedSatoshis: 0n,
      potGoalSatoshis: 4_000n,
      remainingSatoshis: 4_000n,
      percent: 0,
      isReadyToSettle: false,
      canOrganizerCancel: false,
    });

    const partial = computePotProgress(2_000n, 4_000n);
    expect(partial.percent).toBe(50);
    expect(partial.isReadyToSettle).toBe(false);
    expect(partial.canOrganizerCancel).toBe(true);

    const full = computePotProgress(4_000n, 4_000n);
    expect(full.percent).toBe(100);
    expect(full.remainingSatoshis).toBe(0n);
    expect(full.isReadyToSettle).toBe(true);
    expect(full.canOrganizerCancel).toBe(false);
  });

  it("round-trips compact v2 shareable bill URLs (< 180 chars) and stays compatible with legacy v1 JSON tokens", () => {
    const key = generateOrganizerKey("mainnet");
    const payload = {
      v: 1 as const,
      network: "mainnet" as const,
      title: "Makan Sate Bareng",
      billNonceHex: generateRandomBillNonceHex(8),
      merchantAddress: MERCHANT_MAINNET,
      organizerPublicKeyHex: key.publicKeyHex,
      merchantPayoutSatoshis: 3_500,
      settlementFeeSatoshis: 500,
      participants: splitEvenly(4_000, ["Reza", "Budi"]),
      createdAt: Math.floor(Date.now() / 1000),
    };

    const token = encodeShareableBill(payload);
    expect(token).not.toContain("+");
    expect(token).not.toContain("/");
    expect(token.length).toBeLessThan(180);

    const decoded = decodeShareableBill(token);
    expect(decoded).toEqual(payload);

    // Verify legacy v1 base64url JSON tokens still decode cleanly
    const legacyV1Token = Buffer.from(JSON.stringify(payload), "utf8")
      .toString("base64url");
    expect(decodeShareableBill(legacyV1Token)).toEqual(payload);

    const url = buildShareableBillUrl(payload, "https://cakesplit.app/");
    expect(url.startsWith("https://cakesplit.app/bill?d=")).toBe(true);
  });

  it("distributes settlement fee across participant Pay Slices so slices sum to 100% of potGoalSatoshis", () => {
    const twoPeople = computePayableSlices(
      [
        { id: "p-1", label: "You", shareSatoshis: 2_561 },
        { id: "p-2", label: "Friend 2", shareSatoshis: 2_561 },
      ],
      500,
    );
    expect(twoPeople.map((p) => p.payableSatoshis)).toEqual([2_811, 2_811]);
    expect(twoPeople.reduce((sum, p) => sum + p.payableSatoshis, 0)).toBe(5_622);

    const threePeople = computePayableSlices(
      [
        { id: "p-1", label: "A", shareSatoshis: 1_000 },
        { id: "p-2", label: "B", shareSatoshis: 1_000 },
        { id: "p-3", label: "C", shareSatoshis: 1_000 },
      ],
      500,
    );
    expect(threePeople.map((p) => p.feeShareSatoshis)).toEqual([167, 167, 166]);
    expect(threePeople.reduce((sum, p) => sum + p.payableSatoshis, 0)).toBe(3_500);
  });

  it("exports and re-imports organizer WIF keys cleanly on mainnet & chipnet", () => {
    for (const network of ["mainnet", "chipnet"] as const) {
      const generated = generateOrganizerKey(network);
      const wif = exportOrganizerKeyWif(generated.privateKeyHex, network);
      const restored = importOrganizerKeyWif(wif, network);
      expect(restored.privateKeyHex).toBe(generated.privateKeyHex);
      expect(restored.publicKeyHex).toBe(generated.publicKeyHex);
      expect(restored.address).toBe(generated.address);
    }
  });

  it("generates BIP21 payment QR and shareable URL QR data URLs", async () => {
    const qr = await generatePaymentQrDataUrl({
      address: MERCHANT_MAINNET,
      satoshis: 2_000n,
      message: "CakeSplit share",
    });
    expect(qr.uri).toContain("amount=0.00002");
    expect(qr.dataUrl.startsWith("data:image/png;base64,")).toBe(true);

    const urlQr = await generateUrlQrDataUrl("https://cakesplit.app/bill?d=test");
    expect(urlQr.startsWith("data:image/png;base64,")).toBe(true);
  });

  it("formats Mainnet and Chipnet explorer URLs", () => {
    const fakeTxid = "ab".repeat(32);
    expect(getExplorerTxUrl(fakeTxid, "mainnet")).toContain("explorer.bch.ninja/tx/");
    expect(getExplorerTxUrl(fakeTxid, "chipnet")).toContain("chipnet.chaingraph.cash/tx/");
    expect(getExplorerAddressUrl(MERCHANT_MAINNET, "mainnet")).toContain(
      "explorer.bch.ninja/address/",
    );
  });
});
