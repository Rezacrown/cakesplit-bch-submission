import {
  isValidCashAddress,
  satsToBch,
  type BchNetwork,
} from "@/lib/bch/address";
import type { ShareableBillPayload } from "@/lib/bch/bill-link";
import { createSplitBillSchema } from "@/lib/schemas/bill";
import type { SplitParticipantDraft } from "@/store/app-store";
import {
  SETTLEMENT_FEE_SATS,
  USD_PER_BCH_REF,
  type SplitMode,
} from "../constants";

const SATS_PER_BCH_NUMBER = 100_000_000;

export interface BillSummaryMetrics {
  billTotalSats: number;
  networkFeeSats: number;
  sharedPotTargetSats: number;
  hasAmount: boolean;
  participantCount: number;
}

export interface CreateBillFieldErrors {
  title?: string;
  merchantAddress?: string;
  amount?: string;
  participants?: Record<string, string>;
}

export interface ValidatedBillSnapshot {
  network: BchNetwork;
  title: string;
  merchantAddress: string;
  splitMode: SplitMode;
  participants: SplitParticipantDraft[];
  billTotalSats: number;
  networkFeeSats: number;
  sharedPotTargetSats: number;
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
 * Formats integer satoshis into a clean BCH decimal string without trailing zeros.
 */
export function formatSatsAsBch(sats: number): string {
  if (sats <= 0) return "0";
  return satsToBch(Math.trunc(sats));
}

/**
 * Formats integer satoshis into an approximate USD string using the reference rate.
 */
export function formatSatsAsUsdApprox(
  sats: number,
  usdPerBch = USD_PER_BCH_REF,
): string {
  if (sats <= 0) return "$0.00";
  const usd = (sats / SATS_PER_BCH_NUMBER) * usdPerBch;
  if (usd > 0 && usd < 0.01) return "<$0.01";
  return `~$${usd.toFixed(2)}`;
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

/**
 * Quick inline indicator for whether the cashier CashAddress matches the active network.
 */
export function isMerchantAddressValidForNetwork(
  address: string,
  network: BchNetwork,
): boolean {
  return isValidCashAddress(address, network);
}

/**
 * Builds a canonical `ShareableBillPayload` from a validated draft snapshot.
 */
export function buildShareablePayloadFromSnapshot(params: {
  snapshot: ValidatedBillSnapshot;
  organizerPublicKeyHex: string;
  billNonceHex: string;
  createdAt: number;
}): ShareableBillPayload {
  const { snapshot, organizerPublicKeyHex, billNonceHex, createdAt } = params;
  return {
    v: 1,
    network: snapshot.network,
    title: snapshot.title,
    billNonceHex,
    merchantAddress: snapshot.merchantAddress,
    organizerPublicKeyHex,
    merchantPayoutSatoshis: snapshot.billTotalSats,
    settlementFeeSatoshis: snapshot.networkFeeSats,
    participants: snapshot.participants,
    createdAt,
  };
}

/**
 * Validates the complete create-bill form via Zod and maps issues to structured UI fields.
 */
export function validateBillDraft(input: {
  network: BchNetwork;
  title: string;
  merchantAddress: string;
  splitMode: SplitMode;
  participants: SplitParticipantDraft[];
}):
  | { ok: true; snapshot: ValidatedBillSnapshot }
  | { ok: false; firstMessage: string; fieldErrors: CreateBillFieldErrors } {
  const parsed = createSplitBillSchema.safeParse({
    network: input.network,
    title: input.title,
    merchantAddress: input.merchantAddress,
    participants: input.participants,
  });

  if (!parsed.success) {
    const fieldErrors: CreateBillFieldErrors = {};
    const participantErrors: Record<string, string> = {};

    for (const issue of parsed.error.issues) {
      const [root, idx, prop] = issue.path;
      if (root === "title" && !fieldErrors.title) {
        fieldErrors.title = issue.message;
      } else if (root === "merchantAddress" && !fieldErrors.merchantAddress) {
        fieldErrors.merchantAddress = issue.message;
      } else if (root === "participants" && typeof idx === "number") {
        const target = input.participants[idx];
        if (target && !participantErrors[target.id]) {
          participantErrors[target.id] = issue.message;
        }
        if (prop === "shareSatoshis" && !fieldErrors.amount) {
          fieldErrors.amount = issue.message;
        }
      } else if (root === "participants" && !fieldErrors.amount) {
        fieldErrors.amount = issue.message;
      }
    }

    if (Object.keys(participantErrors).length > 0) {
      fieldErrors.participants = participantErrors;
    }

    return {
      ok: false,
      firstMessage:
        parsed.error.issues[0]?.message ?? "Please check the receipt details",
      fieldErrors,
    };
  }

  const summary = computeBillSummary(parsed.data.participants);
  return {
    ok: true,
    snapshot: {
      network: parsed.data.network,
      title: parsed.data.title,
      merchantAddress: parsed.data.merchantAddress,
      splitMode: input.splitMode,
      participants: parsed.data.participants,
      billTotalSats: summary.billTotalSats,
      networkFeeSats: summary.networkFeeSats,
      sharedPotTargetSats: summary.sharedPotTargetSats,
    },
  };
}
