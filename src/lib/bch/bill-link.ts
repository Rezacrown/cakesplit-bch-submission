import { z } from "zod";
import { MIN_COVENANT_DUST_SATS, type BchNetwork } from "@/lib/bch/address";
import {
  decodeRawBillToken,
  encodeCompactBillToken,
} from "@/lib/bch/bill-link-codec";
import { CAKESPLIT_SETTLEMENT_FEE_SATS } from "@/lib/xo/cakesplit-template";
import { bchNetworkSchema, participantShareSchema } from "@/lib/schemas/bill";

export const shareableBillSchema = z.object({
  v: z.literal(1),
  network: bchNetworkSchema,
  title: z.string().trim().min(1).max(80),
  billNonceHex: z.string().regex(/^[0-9a-f]{2,128}$/i, "Invalid billNonceHex"),
  merchantAddress: z.string().min(10),
  organizerPublicKeyHex: z
    .string()
    .regex(/^[0-9a-f]{66}$/i, "Invalid compressed organizerPublicKeyHex"),
  merchantPayoutSatoshis: z.number().int().positive(),
  settlementFeeSatoshis: z.number().int().min(250),
  participants: z.array(participantShareSchema).min(2).max(12),
  createdAt: z.number().int().positive(),
});

export type ShareableBillPayload = z.infer<typeof shareableBillSchema>;

export interface SplitParticipantInput {
  id: string;
  label: string;
  shareSatoshis: number;
}

export interface BillSummary {
  merchantPayoutSatoshis: bigint;
  settlementFeeSatoshis: bigint;
  potGoalSatoshis: bigint;
  participantCount: number;
  sumOfSharesSatoshis: bigint;
}

export interface PotProgress {
  collectedSatoshis: bigint;
  potGoalSatoshis: bigint;
  remainingSatoshis: bigint;
  percent: number;
  isReadyToSettle: boolean;
  canOrganizerCancel: boolean;
}

/**
 * Splits a total satoshi goal evenly across `labels`, distributing any remainder
 * (+1 sat each to the first participants) so zero satoshis are lost to rounding.
 */
export function splitEvenly(
  totalSatoshis: number,
  labels: string[],
): SplitParticipantInput[] {
  if (labels.length < 2) {
    throw new Error("At least 2 participants are required");
  }
  const safeTotal = Math.max(
    Math.trunc(totalSatoshis),
    labels.length * MIN_COVENANT_DUST_SATS,
  );
  const base = Math.floor(safeTotal / labels.length);
  const remainder = safeTotal - base * labels.length;

  return labels.map((label, idx) => ({
    id: `p-${idx + 1}`,
    label: label.trim() || `Person ${idx + 1}`,
    shareSatoshis: base + (idx < remainder ? 1 : 0),
  }));
}

/**
 * Computes exact bill payout, fee buffer, and total pot goal.
 * If participant shares sum to the total collected pot, `merchantPayout = potGoal - settlementFee`.
 */
export function calculateBillSummary(params: {
  participants: SplitParticipantInput[];
  settlementFeeSatoshis?: bigint;
  /**
   * When `true` (default), `settlementFeeSatoshis` is added ON TOP of participant shares
   * (or distributed evenly into requested QR amounts) so the merchant gets 100% of shares sum.
   */
  addFeeOnTop?: boolean;
}): BillSummary {
  const fee = params.settlementFeeSatoshis ?? CAKESPLIT_SETTLEMENT_FEE_SATS;
  const sumShares = params.participants.reduce(
    (sum, p) => sum + BigInt(Math.trunc(p.shareSatoshis)),
    0n,
  );
  const addOnTop = params.addFeeOnTop ?? true;

  if (addOnTop) {
    return {
      merchantPayoutSatoshis: sumShares,
      settlementFeeSatoshis: fee,
      potGoalSatoshis: sumShares + fee,
      participantCount: params.participants.length,
      sumOfSharesSatoshis: sumShares,
    };
  }

  if (sumShares <= fee) {
    throw new Error("Total shares must exceed settlement fee reserve");
  }
  return {
    merchantPayoutSatoshis: sumShares - fee,
    settlementFeeSatoshis: fee,
    potGoalSatoshis: sumShares,
    participantCount: params.participants.length,
    sumOfSharesSatoshis: sumShares,
  };
}

/**
 * Computes live Bill Pot progress and which covenant actions are currently unlockable.
 */
export function computePotProgress(
  collectedSatoshis: bigint,
  potGoalSatoshis: bigint,
): PotProgress {
  const safeCollected = collectedSatoshis < 0n ? 0n : collectedSatoshis;
  const remainingSatoshis =
    safeCollected >= potGoalSatoshis ? 0n : potGoalSatoshis - safeCollected;
  const percent =
    potGoalSatoshis === 0n
      ? 100
      : Math.min(100, Math.round(Number((safeCollected * 10000n) / potGoalSatoshis) / 100));

  const isReadyToSettle = safeCollected >= potGoalSatoshis;
  const canOrganizerCancel = safeCollected > 0n && safeCollected < potGoalSatoshis;

  return {
    collectedSatoshis: safeCollected,
    potGoalSatoshis,
    remainingSatoshis,
    percent,
    isReadyToSettle,
    canOrganizerCancel,
  };
}

export interface PayableParticipantSlice extends SplitParticipantInput {
  subtotalSatoshis: number;
  feeShareSatoshis: number;
  payableSatoshis: number;
}

/**
 * Distributes the fixed network settlement fee buffer across all participants so that
 * summing every participant's `Pay Slice` QR equals 100% of `potGoalSatoshis`.
 */
export function computePayableSlices(
  participants: SplitParticipantInput[],
  settlementFeeSatoshis: number | bigint,
): PayableParticipantSlice[] {
  const count = participants.length;
  if (count === 0) return [];
  const totalFee = Math.max(0, Number(settlementFeeSatoshis));
  const baseFee = Math.floor(totalFee / count);
  const remainder = totalFee - baseFee * count;

  return participants.map((participant, idx) => {
    const subtotalSatoshis = Math.trunc(participant.shareSatoshis);
    const feeShareSatoshis = baseFee + (idx < remainder ? 1 : 0);
    return {
      ...participant,
      subtotalSatoshis,
      feeShareSatoshis,
      payableSatoshis: subtotalSatoshis + feeShareSatoshis,
    };
  });
}

/**
 * Encodes a CakeSplit bill into a compact v2 URL-safe binary token (serverless, ~3x shorter for QR).
 */
export function encodeShareableBill(payload: ShareableBillPayload): string {
  const validated = shareableBillSchema.parse(payload);
  return encodeCompactBillToken(validated);
}

/**
 * Decodes and Zod-validates either a compact v2 binary token or a legacy v1 JSON token.
 */
export function decodeShareableBill(encoded: string): ShareableBillPayload {
  const parsed = decodeRawBillToken(encoded);
  return shareableBillSchema.parse(parsed);
}

/**
 * Builds a shareable `/bill?d=...` URL for friends to open, scan QR, or settle.
 */
export function buildShareableBillUrl(
  payload: ShareableBillPayload,
  origin?: string,
): string {
  const token = encodeShareableBill(payload);
  const base = origin ? origin.replace(/\/$/, "") : "";
  return `${base}/bill?d=${token}`;
}

export function generateRandomBillNonceHex(byteLength = 8): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function formatNetworkLabel(network: BchNetwork): string {
  return network === "mainnet" ? "BCH Mainnet" : "BCH Chipnet (Testnet)";
}
