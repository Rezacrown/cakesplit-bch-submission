import { satsToBch } from "@/lib/bch/address";
import { FALLBACK_BCH_USD_PRICE } from "@/services/client/priceService";
import type { SplitParticipantDraft } from "@/store/app-store";
import {
  SETTLEMENT_FEE_SATS,
  type InputCurrencyUnit,
} from "../constants";

const SATS_PER_BCH_NUMBER = 100_000_000;

export interface BillSummaryMetrics {
  billTotalSats: number;
  networkFeeSats: number;
  sharedPotTargetSats: number;
  hasAmount: boolean;
  participantCount: number;
}

/**
 * Parses a decimal BCH text input into integer satoshis.
 * Returns 0 for empty or malformed values so live UI calculations never throw.
 */
export function parseBchInputToSats(raw: string): number {
  const cleaned = raw.trim().replace(/,/g, "");
  if (!cleaned || !/^\d*(\.\d{0,8})?$/.test(cleaned)) {
    return 0;
  }
  const [wholePart = "0", fracPart = ""] = cleaned.split(".");
  const wholeSats = Number(wholePart || "0") * SATS_PER_BCH_NUMBER;
  const fracSats = Number(fracPart.padEnd(8, "0").slice(0, 8));
  const total = wholeSats + fracSats;
  if (!Number.isSafeInteger(total) || total < 0) {
    return 0;
  }
  return total;
}

/**
 * Converts a USD text input (e.g. "40.00" or "0.02") into exact integer satoshis
 * using the active BCH/USD exchange rate.
 */
export function parseUsdToSatoshis(
  usdInput: string,
  bchUsdPrice: number,
): number {
  const cleaned = usdInput.trim().replace(/,/g, "");
  if (
    !cleaned ||
    !/^\d*(\.\d*)?$/.test(cleaned) ||
    !Number.isFinite(bchUsdPrice) ||
    bchUsdPrice <= 0
  ) {
    return 0;
  }
  const usd = Number(cleaned);
  if (!Number.isFinite(usd) || usd <= 0) {
    return 0;
  }
  const sats = Math.round((usd / bchUsdPrice) * SATS_PER_BCH_NUMBER);
  if (!Number.isSafeInteger(sats) || sats <= 0) {
    return 0;
  }
  return sats;
}

/**
 * Converts integer satoshis back into an editable USD input string without losing
 * sub-cent precision on micro Mainnet amounts (e.g. 0.008).
 */
export function satoshisToUsdInput(
  satoshis: number,
  bchUsdPrice: number,
): string {
  if (
    satoshis <= 0 ||
    !Number.isFinite(bchUsdPrice) ||
    bchUsdPrice <= 0
  ) {
    return "";
  }
  const usd = (Math.trunc(satoshis) / SATS_PER_BCH_NUMBER) * bchUsdPrice;
  if (usd >= 1) {
    return usd.toFixed(2);
  }
  if (usd >= 0.01) {
    const roundedCents = Math.round(usd * 100) / 100;
    if (Math.abs(usd - roundedCents) < 0.0001) {
      return usd.toFixed(2);
    }
  }
  const micro = usd.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
  return micro === "0" ? "" : micro;
}

/**
 * Formats satoshis as a crisp USD label: standard 2 decimals for >= $0.01,
 * up to 4 decimals for micro amounts (e.g. $0.008), and `< $0.01` for sub-0.0001 dust.
 */
export function formatUsdFromSatoshis(
  satoshis: number | bigint,
  bchUsdPrice = FALLBACK_BCH_USD_PRICE,
): string {
  const sats =
    typeof satoshis === "bigint" ? Number(satoshis) : Math.trunc(satoshis);
  if (sats <= 0 || !Number.isFinite(bchUsdPrice) || bchUsdPrice <= 0) {
    return "$0.00";
  }
  const usd = (sats / SATS_PER_BCH_NUMBER) * bchUsdPrice;
  if (usd >= 0.01) {
    return `$${usd.toFixed(2)}`;
  }
  if (usd >= 0.0001) {
    return `$${usd.toFixed(4).replace(/0+$/, "")}`;
  }
  return "< $0.01";
}

/**
 * Formats integer satoshis into a clean BCH decimal string without trailing zeros.
 */
export function formatSatsAsBch(sats: number): string {
  if (sats <= 0) return "0";
  return satsToBch(Math.trunc(sats));
}

export function parseUnitInputToSatoshis(
  raw: string,
  unit: InputCurrencyUnit,
  bchUsdPrice: number,
): number {
  return unit === "usd"
    ? parseUsdToSatoshis(raw, bchUsdPrice)
    : parseBchInputToSats(raw);
}

export function satoshisToUnitInput(
  satoshis: number,
  unit: InputCurrencyUnit,
  bchUsdPrice: number,
): string {
  if (satoshis <= 0) return "";
  return unit === "usd"
    ? satoshisToUsdInput(satoshis, bchUsdPrice)
    : formatSatsAsBch(satoshis);
}

/**
 * Divides a total satoshi amount evenly across `count` diners,
 * assigning any indivisible remainder satoshis (+1 each) to the first seats
 * so the sum of slices always equals `totalSats` exactly.
 */
export function computeEqualSplitSats(
  totalSats: number,
  count: number,
): number[] {
  if (count <= 0) return [];
  if (totalSats <= 0) return Array.from({ length: count }, () => 0);

  const safeTotal = Math.trunc(totalSats);
  const base = Math.floor(safeTotal / count);
  const remainder = safeTotal % count;

  return Array.from({ length: count }, (_, idx) =>
    idx < remainder ? base + 1 : base,
  );
}

/**
 * Computes receipt totals including the transparent 500-sat settlement buffer.
 */
export function computeBillSummary(
  participants: SplitParticipantDraft[],
): BillSummaryMetrics {
  const billTotalSats = participants.reduce(
    (sum, person) => sum + Math.max(0, Math.trunc(person.shareSatoshis)),
    0,
  );
  const hasAmount = billTotalSats > 0;
  const networkFeeSats = SETTLEMENT_FEE_SATS;
  const sharedPotTargetSats = hasAmount ? billTotalSats + networkFeeSats : 0;

  return {
    billTotalSats,
    networkFeeSats,
    sharedPotTargetSats,
    hasAmount,
    participantCount: participants.length,
  };
}

export function buildCustomInputMap(
  participants: SplitParticipantDraft[],
  unit: InputCurrencyUnit,
  priceUsd: number,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const person of participants) {
    map[person.id] = satoshisToUnitInput(person.shareSatoshis, unit, priceUsd);
  }
  return map;
}

export function applyEqualSplitToParticipants(
  participants: SplitParticipantDraft[],
  rawTotal: string,
  unit: InputCurrencyUnit,
  priceUsd: number,
): SplitParticipantDraft[] {
  const totalSats = parseUnitInputToSatoshis(rawTotal, unit, priceUsd);
  const slices = computeEqualSplitSats(totalSats, participants.length);
  return participants.map((person, idx) => ({
    ...person,
    shareSatoshis: slices[idx] ?? 0,
  }));
}
