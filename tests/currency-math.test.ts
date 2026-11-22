import { describe, expect, it } from "vitest";
import { DEFAULT_ELECTRUM_SERVERS } from "@/lib/bch/electrum";
import {
  formatUsdFromSatoshis,
  parseUsdToSatoshis,
  satoshisToUsdInput,
} from "@/modules/create-bill/_utils/billFormMath";

describe("USD <-> BCH satoshi conversion & Mainnet Fulcrum config", () => {
  it("converts USD inputs to exact integer satoshis", () => {
    expect(parseUsdToSatoshis("40.00", 200)).toBe(20_000_000);
    expect(parseUsdToSatoshis("0.02", 200)).toBe(10_000);
    expect(parseUsdToSatoshis("0.008", 200)).toBe(4_000);
    expect(parseUsdToSatoshis("", 200)).toBe(0);
    expect(parseUsdToSatoshis("abc", 200)).toBe(0);
    expect(parseUsdToSatoshis("10", 0)).toBe(0);
  });

  it("round-trips satoshis back to crisp USD input strings without losing micro precision", () => {
    expect(satoshisToUsdInput(20_000_000, 200)).toBe("40.00");
    expect(satoshisToUsdInput(10_000, 200)).toBe("0.02");
    expect(satoshisToUsdInput(4_000, 200)).toBe("0.008");
    expect(satoshisToUsdInput(0, 200)).toBe("");
    expect(parseUsdToSatoshis(satoshisToUsdInput(4_000, 200), 200)).toBe(4_000);
  });

  it("formats USD labels crisply for standard, micro, and sub-dust satoshi amounts", () => {
    expect(formatUsdFromSatoshis(0, 200)).toBe("$0.00");
    expect(formatUsdFromSatoshis(20_000_000, 200)).toBe("$40.00");
    expect(formatUsdFromSatoshis(10_000, 200)).toBe("$0.02");
    expect(formatUsdFromSatoshis(4_000, 200)).toBe("$0.008");
    expect(formatUsdFromSatoshis(500n, 400)).toBe("$0.002");
    expect(formatUsdFromSatoshis(10, 200)).toBe("< $0.01");
  });

  it("configures the 4 official 2026 Mainnet Fulcrum WSS endpoints", () => {
    expect(DEFAULT_ELECTRUM_SERVERS.mainnet).toEqual([
      { host: "bch.imaginary.cash", port: 50004, scheme: "wss" },
      { host: "electrum.imaginary.cash", port: 50004, scheme: "wss" },
      { host: "cashnode.bch.ninja", port: 50004, scheme: "wss" },
      { host: "fulcrum.greyh.at", port: 50004, scheme: "wss" },
    ]);
  });
});
