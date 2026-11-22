import {
  cashAddressToLockingHex,
  compileCakeSplitContract,
  decodeShareableBill,
  type BchNetwork,
  type CompiledCakeSplitContract,
  type OrganizerKeyPair,
} from "@/lib/bch";
import {
  CAKESPLIT_TEMPLATE_ID,
  cakeSplitTemplate,
  createSignedCakeSplitInvitation,
  serializeCakeSplitTemplate,
  verifyCakeSplitInvitation,
  type CakeSplitActionId,
  type CakeSplitRoleId,
} from "@/lib/xo";
import {
  CANONICAL_MERCHANT_ADDRESS,
  CANONICAL_NONCE_HEX,
  CANONICAL_PAYOUT_SATS,
  XO_ACTION_SPECS,
} from "../constants";

export interface InspectorContractContext {
  source: "bill" | "canonical";
  billToken: string | null;
  billTitle: string;
  contract: CompiledCakeSplitContract;
}

export interface InspectedInvitationEntry {
  actionId: CakeSplitActionId;
  role: CakeSplitRoleId;
  invitationIdentifier: string;
  entityIdentifier: string;
  verified: boolean;
  verificationError?: string;
  rawJson: string;
  prettyJson: string;
}

export interface XoInspectorSnapshot {
  templateId: string;
  templateName: string;
  lockingType: "P2SH32";
  redeemScriptBytes: number;
  rawTemplateJson: string;
  context: InspectorContractContext;
  invitations: Record<CakeSplitActionId, InspectedInvitationEntry>;
}

/**
 * Formats an Extended JSON string cleanly for readable display while preserving raw export fidelity.
 */
export function formatJsonForDisplay(rawJson: string): string {
  try {
    return JSON.stringify(JSON.parse(rawJson), null, 2);
  } catch {
    return rawJson;
  }
}

export function truncateIdentifier(
  value: string,
  head = 16,
  tail = 10,
): string {
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

/**
 * Compiles either the active `?d=...` table check contract or a canonical contract from the local organizer key.
 */
export function buildInspectorContractContext(params: {
  billToken: string | null;
  network: BchNetwork;
  organizerKey: OrganizerKeyPair;
}): InspectorContractContext {
  const { billToken, network, organizerKey } = params;

  if (billToken) {
    try {
      const bill = decodeShareableBill(billToken);
      const contract = compileCakeSplitContract({
        billNonceHex: bill.billNonceHex,
        merchantAddress: bill.merchantAddress,
        merchantPayoutSatoshis: BigInt(bill.merchantPayoutSatoshis),
        organizerPublicKeyHex: bill.organizerPublicKeyHex,
        network: bill.network,
        settlementFeeSatoshis: BigInt(bill.settlementFeeSatoshis),
      });
      return {
        source: "bill",
        billToken,
        billTitle: bill.title,
        contract,
      };
    } catch {
      // Fall through cleanly to canonical contract if query token is malformed.
    }
  }

  const contract = compileCakeSplitContract({
    billNonceHex: CANONICAL_NONCE_HEX,
    merchantAddress: CANONICAL_MERCHANT_ADDRESS[network],
    merchantPayoutSatoshis: CANONICAL_PAYOUT_SATS,
    organizerPublicKeyHex: organizerKey.publicKeyHex,
    network,
  });

  return {
    source: "canonical",
    billToken: null,
    billTitle: "Canonical CakeSplit Contract",
    contract,
  };
}

/**
 * Pure offline generator & cryptographic Schnorr verifier for all 4 CakeSplit XO invitations.
 */
export function buildXoInspectorSnapshot(params: {
  billToken: string | null;
  network: BchNetwork;
  organizerKey: OrganizerKeyPair;
}): XoInspectorSnapshot {
  const context = buildInspectorContractContext(params);
  const { contract } = context;
  const refundLockingHex = cashAddressToLockingHex(params.organizerKey.address);
  const halfPot =
    contract.merchantPayoutSatoshis > 2_000n
      ? contract.merchantPayoutSatoshis / 2n
      : 1_000n;
  const remainingContribution =
    contract.potGoalSatoshis > halfPot
      ? contract.potGoalSatoshis - halfPot
      : 1_000n;

  const entries = {} as Record<CakeSplitActionId, InspectedInvitationEntry>;

  for (const spec of XO_ACTION_SPECS) {
    const signed = createSignedCakeSplitInvitation({
      contract,
      actionIdentifier: spec.id,
      privateKeyHex: params.organizerKey.privateKeyHex,
      initialDepositSatoshis: halfPot,
      currentPotSatoshis:
        spec.id === "settleBill" ? contract.potGoalSatoshis : halfPot,
      contributionSatoshis: remainingContribution,
      refundLockingHex,
      memo: `${context.billTitle} — ${spec.id}`,
    });

    const verification = verifyCakeSplitInvitation(signed.serializedJson);

    entries[spec.id] = {
      actionId: spec.id,
      role: spec.role,
      invitationIdentifier: signed.invitation.invitationIdentifier,
      entityIdentifier: signed.entityIdentifier,
      verified: verification.valid,
      verificationError: verification.error,
      rawJson: signed.serializedJson,
      prettyJson: formatJsonForDisplay(signed.serializedJson),
    };
  }

  return {
    templateId: CAKESPLIT_TEMPLATE_ID,
    templateName: cakeSplitTemplate.name,
    lockingType: "P2SH32",
    redeemScriptBytes: contract.redeemBytecode.length,
    rawTemplateJson: serializeCakeSplitTemplate(),
    context,
    invitations: entries,
  };
}
