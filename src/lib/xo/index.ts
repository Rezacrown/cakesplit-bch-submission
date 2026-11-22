import type { XOInvitation, XOTemplate } from "@xo-cash/types";
import {
  faucetCashTemplate,
  multisigTemplate,
  p2pkhTemplate,
} from "@xo-cash/templates";
import {
  CAKESPLIT_MIN_POT_SATS,
  CAKESPLIT_SETTLEMENT_FEE_SATS,
  CAKESPLIT_TEMPLATE_ID,
  cakeSplitTemplate,
  serializeCakeSplitTemplate,
} from "@/lib/xo/cakesplit-template";
import {
  buildCakeSplitActionBundle,
  compileBillPotViaXoCashAsm,
  createSignedCakeSplitInvitation,
  parseCakeSplitInvitation,
  resolveXoSeedBytes,
  serializeCakeSplitInvitation,
  verifyCakeSplitInvitation,
  type CakeSplitActionBundle,
  type CakeSplitActionId,
  type CakeSplitRoleId,
  type CreateSignedInvitationParams,
  type InvitationVerificationReport,
  type SignedCakeSplitInvitationResult,
} from "@/lib/xo/cakesplit-xo";

export const XO_ENGINE_PACKAGE_VERSION = "0.1.1-next.18230317763";
export const XO_DEBUG_TOOL_URL = "https://blaze.xo.cash/";

export type {
  CakeSplitActionBundle,
  CakeSplitActionId,
  CakeSplitRoleId,
  CreateSignedInvitationParams,
  InvitationVerificationReport,
  SignedCakeSplitInvitationResult,
  XOInvitation,
  XOTemplate,
};
export {
  buildCakeSplitActionBundle,
  CAKESPLIT_MIN_POT_SATS,
  CAKESPLIT_SETTLEMENT_FEE_SATS,
  CAKESPLIT_TEMPLATE_ID,
  cakeSplitTemplate,
  compileBillPotViaXoCashAsm,
  createSignedCakeSplitInvitation,
  faucetCashTemplate,
  multisigTemplate,
  p2pkhTemplate,
  parseCakeSplitInvitation,
  resolveXoSeedBytes,
  serializeCakeSplitInvitation,
  serializeCakeSplitTemplate,
  verifyCakeSplitInvitation,
};
