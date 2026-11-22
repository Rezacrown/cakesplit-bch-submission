import { describe, expect, it } from "vitest";
import { Engine } from "@xo-cash/engine";
import {
  bchToSats,
  buildBip21Uri,
  cashAddressToLockingHex,
  isValidCashAddress,
  lockingHexToCashAddress,
  satsToBch,
} from "@/lib/bch/address";
import { createSplitBillSchema } from "@/lib/schemas/bill";
import { faucetCashTemplate, multisigTemplate } from "@/lib/xo";

const SAMPLE_MAINNET_ADDRESS =
  "bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a";
const SAMPLE_CHIPNET_ADDRESS =
  "bchtest:qpm2qsznhks23z7629mms6s4cwef74vcwvqcw003ap";

describe("BCH + XO minimal scaffold", () => {
  it("loads @xo-cash/engine and official templates", () => {
    expect(typeof Engine).toBe("function");
    expect(faucetCashTemplate.name).toBe("faucet.cash");
    expect(multisigTemplate.lockingScripts.multisigLockingScript.lockingType).toBe("p2sh");
  });

  it("validates and round-trips CashAddress <-> locking bytecode via libauth v3", () => {
    expect(isValidCashAddress(SAMPLE_MAINNET_ADDRESS, "mainnet")).toBe(true);
    expect(isValidCashAddress(SAMPLE_MAINNET_ADDRESS, "chipnet")).toBe(false);
    expect(isValidCashAddress(SAMPLE_CHIPNET_ADDRESS, "chipnet")).toBe(true);
    expect(isValidCashAddress("not-an-address")).toBe(false);

    const lockingHex = cashAddressToLockingHex(SAMPLE_MAINNET_ADDRESS);
    expect(lockingHex).toHaveLength(50); // 25-byte P2PKH locking bytecode
    expect(lockingHexToCashAddress(lockingHex, "mainnet")).toBe(SAMPLE_MAINNET_ADDRESS);
    expect(lockingHexToCashAddress(lockingHex, "chipnet")).toBe(SAMPLE_CHIPNET_ADDRESS);
  });

  it("formats satoshis <-> BCH and builds BIP21 URIs accurately", () => {
    expect(satsToBch(3000)).toBe("0.00003");
    expect(bchToSats("0.00003")).toBe(3000n);
    expect(
      buildBip21Uri({
        address: SAMPLE_CHIPNET_ADDRESS,
        satoshis: 1500,
        message: "Split Dinner",
      }),
    ).toBe(`${SAMPLE_CHIPNET_ADDRESS}?amount=0.000015&message=Split+Dinner`);
  });

  it("validates split bill payload with Zod + CashAddress network guard", () => {
    const ok = createSplitBillSchema.safeParse({
      network: "chipnet",
      title: "Makan Bakso Bareng",
      merchantAddress: SAMPLE_CHIPNET_ADDRESS,
      participants: [
        { id: "1", label: "Host", shareSatoshis: 1500 },
        { id: "2", label: "Budi", shareSatoshis: 1500 },
      ],
    });
    expect(ok.success).toBe(true);

    const wrongNetwork = createSplitBillSchema.safeParse({
      network: "chipnet",
      title: "Makan Bakso Bareng",
      merchantAddress: SAMPLE_MAINNET_ADDRESS,
      participants: [
        { id: "1", label: "Host", shareSatoshis: 1500 },
        { id: "2", label: "Budi", shareSatoshis: 1500 },
      ],
    });
    expect(wrongNetwork.success).toBe(false);
  });
});
