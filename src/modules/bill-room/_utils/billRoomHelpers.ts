import {
  compileCakeSplitContract,
  computePotProgress,
  decodeShareableBill,
  satsToBch,
  type BchNetwork,
  type CompiledCakeSplitContract,
  type PotProgress,
  type ShareableBillPayload,
} from "@/lib/bch";
import { FALLBACK_BCH_USD_PRICE } from "@/services/client/priceService";

const SATS_PER_BCH_NUMBER = 100_000_000;

export interface CompiledBillRoomState {
  token: string;
  bill: ShareableBillPayload;
  contract: CompiledCakeSplitContract;
  potProgress: PotProgress;
}

export type ParseBillRoomResult =
  | { ok: true; data: CompiledBillRoomState }
  | { ok: false; error: string };

/**
 * Extracts a CakeSplit `?d=...` token from either a full URL, query fragment, or raw base64url token.
 */
export function extractBillToken(rawInput: string): string | null {
  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  if (trimmed.includes("d=")) {
    try {
      const normalized = trimmed.startsWith("http")
        ? trimmed
        : trimmed.startsWith("/")
          ? `https://cakesplit.local${trimmed}`
          : trimmed.startsWith("?")
            ? `https://cakesplit.local/bill${trimmed}`
            : `https://cakesplit.local/bill?${trimmed}`;
      const parsedUrl = new URL(normalized);
      const param = parsedUrl.searchParams.get("d")?.trim();
      if (param) return param;
    } catch {
      const match = /[?&]d=([^&#\s]+)/.exec(trimmed);
      if (match?.[1]) return match[1].trim();
    }
  }

  return /^[A-Za-z0-9_-]{16,}$/.test(trimmed) ? trimmed : null;
}

/**
 * Pure offline decoder & deterministic P2SH32 compiler for a CakeSplit `?d=...` bill token.
 */
export function parseAndCompileBillToken(token: string): ParseBillRoomResult {
  const cleaned = token.trim();
  if (!cleaned) {
    return { ok: false, error: "Bill token is empty." };
  }

  try {
    const bill = decodeShareableBill(cleaned);
    const contract = compileCakeSplitContract({
      billNonceHex: bill.billNonceHex,
      merchantAddress: bill.merchantAddress,
      merchantPayoutSatoshis: BigInt(bill.merchantPayoutSatoshis),
      organizerPublicKeyHex: bill.organizerPublicKeyHex,
      network: bill.network,
      settlementFeeSatoshis: BigInt(bill.settlementFeeSatoshis),
    });
    const potProgress = computePotProgress(0n, contract.potGoalSatoshis);

    return {
      ok: true,
      data: {
        token: cleaned,
        bill,
        contract,
        potProgress,
      },
    };
  } catch {
    return {
      ok: false,
      error:
        "That link does not match a valid CakeSplit table check. Double-check the full link and try again.",
    };
  }
}

export function truncateMiddle(
  value: string,
  head = 18,
  tail = 8,
): string {
  const trimmed = value.trim();
  if (trimmed.length <= head + tail + 3) return trimmed;
  return `${trimmed.slice(0, head)}...${trimmed.slice(-tail)}`;
}

export function formatSatsCount(sats: bigint | number): string {
  const num = typeof sats === "bigint" ? Number(sats) : Math.trunc(sats);
  return num.toLocaleString("en-US");
}

export function formatBchAmount(sats: bigint | number): string {
  return satsToBch(sats);
}

/**
 * Formats satoshis as a live USD string, showing up to 4 decimals for micro amounts
 * (e.g. $0.008) so low-value Mainnet testing stays legible.
 */
export function formatUsdApprox(
  sats: bigint | number,
  usdPerBch = FALLBACK_BCH_USD_PRICE,
): string {
  const value = typeof sats === "bigint" ? Number(sats) : Math.trunc(sats);
  if (value <= 0 || !Number.isFinite(usdPerBch) || usdPerBch <= 0) {
    return "$0.00";
  }
  const usd = (value / SATS_PER_BCH_NUMBER) * usdPerBch;
  if (usd >= 0.01) {
    return `$${usd.toFixed(2)}`;
  }
  if (usd >= 0.0001) {
    return `$${usd.toFixed(4).replace(/0+$/, "")}`;
  }
  return "< $0.01";
}

export function formatNetworkBadge(network: BchNetwork): string {
  return network === "mainnet" ? "Bitcoin Cash Mainnet" : "Chipnet";
}

export function formatSyncTimestamp(timestampMs: number | null): string {
  if (!timestampMs) return "";
  return new Date(timestampMs).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
