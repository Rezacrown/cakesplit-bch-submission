import { isValidCashAddress, type BchNetwork } from "@/lib/bch/address";
import type { ShareableBillPayload } from "@/lib/bch/bill-link";
import { createSplitBillSchema } from "@/lib/schemas/bill";
import type { SplitParticipantDraft } from "@/store/app-store";
import type { SplitMode } from "../constants";
import { computeBillSummary } from "./billFormMath";

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
