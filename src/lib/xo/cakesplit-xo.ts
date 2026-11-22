import { hexToBin, sha256, binToHex, encodeLockingBytecodeP2sh32 } from "@bitauth/libauth";
import type { XOInvitation } from "@xo-cash/types";
import {
  compileCashAssemblyString,
  deserializeInvitation,
  parseInvitation,
  serializeInvitation,
} from "@xo-cash/utils";
import {
  CAKESPLIT_SETTLEMENT_FEE_SATS,
  CAKESPLIT_TEMPLATE_ID,
  cakeSplitTemplate,
} from "@/lib/xo/cakesplit-template";
import type { CompiledCakeSplitContract } from "@/lib/bch/cakesplit-contract";

export type CakeSplitActionId = "openBill" | "chipIn" | "settleBill" | "cancelBill";

/**
 * Compiles the `billPotRedeemScript` directly via General Protocols' official
 * `@xo-cash/utils` CashASM compiler (`compileCashAssemblyString`) and wraps it as P2SH32.
 *
 * Used both for runtime verification and automated bytecode-parity tests so we guarantee
 * 0% mismatch between the XO Template and our deterministic contract compiler.
 */
export function compileBillPotViaXoCashAsm(params: {
  billNonceHex: string;
  merchantLockingHex: string;
  merchantPayoutSatoshis: bigint;
  organizerPublicKeyHex: string;
}): {
  redeemBytecodeHex: string;
  lockingBytecodeHex: string;
} {
  const redeemBytecodeHex = compileCashAssemblyString({
    cashAssemblyText: cakeSplitTemplate.scripts.billPotRedeemScript,
    variables: {
      billNonce: hexToBin(params.billNonceHex),
      merchantLockingScript: hexToBin(params.merchantLockingHex),
      merchantPayoutSatoshis: params.merchantPayoutSatoshis,
      organizerPublicKey: hexToBin(params.organizerPublicKeyHex),
      settlementFeeSatoshis: CAKESPLIT_SETTLEMENT_FEE_SATS,
    },
    templateVariables: cakeSplitTemplate.variables,
    templateScripts: cakeSplitTemplate.scripts,
    evaluationDecodeMode: "hex",
  });

  const redeemBytes = hexToBin(redeemBytecodeHex);
  const lockingBytecode = encodeLockingBytecodeP2sh32(
    sha256.hash(sha256.hash(redeemBytes)),
  );

  return {
    redeemBytecodeHex,
    lockingBytecodeHex: binToHex(lockingBytecode),
  };
}

/**
 * Exports a clean, schema-validated XO Template JSON + action variable bundle
 * ready for inspection or reproduction in `https://blaze.xo.cash/`.
 */
export interface CakeSplitActionBundle {
  templateIdentifier: string;
  actionIdentifier: CakeSplitActionId;
  roleIdentifier: "organizer" | "contributor" | "settler";
  variables: Record<string, string | bigint>;
  contractAddress: string;
  lockingBytecodeHex: string;
  redeemBytecodeHex: string;
  debugToolUrl: string;
}

export function buildCakeSplitActionBundle(params: {
  contract: CompiledCakeSplitContract;
  actionIdentifier: CakeSplitActionId;
  initialDepositSatoshis?: bigint;
  currentPotSatoshis?: bigint;
  contributionSatoshis?: bigint;
  refundLockingHex?: string;
}): CakeSplitActionBundle {
  const { contract, actionIdentifier } = params;

  const baseVariables: Record<string, string | bigint> = {
    billNonce: contract.billNonceHex,
    merchantLockingScript: contract.merchantLockingHex,
    merchantPayoutSatoshis: contract.merchantPayoutSatoshis,
    organizerPublicKey: contract.organizerPublicKeyHex,
  };

  let roleIdentifier: "organizer" | "contributor" | "settler" = "organizer";
  if (actionIdentifier === "openBill") {
    roleIdentifier = "organizer";
    baseVariables.initialDepositSatoshis =
      params.initialDepositSatoshis ?? contract.potGoalSatoshis;
  } else if (actionIdentifier === "chipIn") {
    roleIdentifier = "contributor";
    baseVariables.currentPotSatoshis = params.currentPotSatoshis ?? 0n;
    baseVariables.contributionSatoshis = params.contributionSatoshis ?? 0n;
  } else if (actionIdentifier === "settleBill") {
    roleIdentifier = "settler";
    baseVariables.currentPotSatoshis =
      params.currentPotSatoshis ?? contract.potGoalSatoshis;
  } else {
    roleIdentifier = "organizer";
    baseVariables.currentPotSatoshis = params.currentPotSatoshis ?? 0n;
    if (params.refundLockingHex) {
      baseVariables.refundLockingScript = params.refundLockingHex;
    }
  }

  return {
    templateIdentifier: CAKESPLIT_TEMPLATE_ID,
    actionIdentifier,
    roleIdentifier,
    variables: baseVariables,
    contractAddress: contract.contractAddress,
    lockingBytecodeHex: contract.lockingBytecodeHex,
    redeemBytecodeHex: contract.redeemBytecodeHex,
    debugToolUrl: "https://blaze.xo.cash/",
  };
}

export function serializeCakeSplitInvitation(invitation: XOInvitation): string {
  return serializeInvitation(invitation);
}

export function parseCakeSplitInvitation(input: string | XOInvitation): XOInvitation {
  return typeof input === "string" ? deserializeInvitation(input) : parseInvitation(input);
}
