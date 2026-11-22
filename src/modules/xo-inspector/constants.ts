import type { BchNetwork } from "@/lib/bch/address";
import type { CakeSplitActionId, CakeSplitRoleId } from "@/lib/xo";

export const XO_DEBUG_URL = "https://blaze.xo.cash/";

export const CANONICAL_NONCE_HEX = "cafebabe01020304";
export const CANONICAL_PAYOUT_SATS = 10_000n;

export const CANONICAL_MERCHANT_ADDRESS: Record<BchNetwork, string> = {
  mainnet: "bitcoincash:qr4jg99w7eeupyd9hch370t3ffkd8kmmfszwxk6ml2",
  chipnet: "bchtest:qpm2qsznhks23z7629mms6s4cwef74vcwvqcw003ap",
};

export const XO_HEADER_COPY = {
  eyebrow: "BUILD WITH XO / CONTRACT VERIFICATION",
  title: "XO Contract Inspector",
  subtitle:
    "Verify the CakeSplit template, inspect signed invitations, and open them directly in blaze.xo.cash.",
} as const;

export interface ActionSpec {
  id: CakeSplitActionId;
  label: string;
  role: CakeSplitRoleId;
  branchTag: string;
  ruleSummary: string;
}

export const XO_ACTION_SPECS: ActionSpec[] = [
  {
    id: "openBill",
    label: "openBill",
    role: "organizer",
    branchTag: "Genesis Output",
    ruleSummary:
      "Locks the initial deposit into the P2SH32 Bill Pot bound to billNonce, cashier script, and payout goal.",
  },
  {
    id: "chipIn",
    label: "chipIn",
    role: "contributor",
    branchTag: "Branch 0 / Permissionless",
    ruleSummary:
      "Preserves identical covenant bytecode at output 0 while enforcing strictly higher satoshi value.",
  },
  {
    id: "settleBill",
    label: "settleBill",
    role: "settler",
    branchTag: "Branch 1 / Zero Signatures",
    ruleSummary:
      "Anyone sweeps the funded pot straight to the locked cashier address once output 0 >= payout target.",
  },
  {
    id: "cancelBill",
    label: "cancelBill",
    role: "organizer",
    branchTag: "Branch 2 / Pre-Full Guard",
    ruleSummary:
      "Host Schnorr signature can reclaim funds only while pot < payout + 500 sats; locked forever once full.",
  },
];
