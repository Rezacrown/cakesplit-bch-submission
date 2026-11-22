export const SETTLEMENT_FEE_SATS = 500;
export const USD_PER_BCH_REF = 200;
export const MIN_PARTICIPANTS = 2;
export const MAX_PARTICIPANTS = 12;
export const MIN_SLICE_SATS = 1_000;

export type SplitMode = "equal" | "custom";

export interface TrustGuarantee {
  id: "pot" | "settle" | "cancel";
  title: string;
  description: string;
}

export const TRUST_GUARANTEES: TrustGuarantee[] = [
  {
    id: "pot",
    title: "One shared pot",
    description: "Friends pay their slice straight from any Bitcoin Cash wallet.",
  },
  {
    id: "settle",
    title: "One-tap cashier payout",
    description: "Once full, anyone at the table can settle straight to the cashier.",
  },
  {
    id: "cancel",
    title: "Cancel safety built in",
    description: "Cancel anytime before the pot is full — locked once funded.",
  },
];

export interface HowItWorksStep {
  stepNumber: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  accentBg: string;
}

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    stepNumber: "01",
    title: "Slice the Receipt",
    description: "Set the bill total and cashier address in seconds.",
    imageSrc: "/mascots/step-split.png",
    imageAlt: "CakeSplit mascot holding a split bill receipt",
    accentBg: "bg-[#FFD166]/35",
  },
  {
    stepNumber: "02",
    title: "Everyone Scans & Chips In",
    description: "Friends pay their slice from any Bitcoin Cash wallet.",
    imageSrc: "/mascots/step-pay.png",
    imageAlt: "CakeSplit mascot paying with a Bitcoin Cash phone wallet",
    accentBg: "bg-[#0AC18E]/20",
  },
  {
    stepNumber: "03",
    title: "One Tap Pays the Cashier",
    description: "Once the pot is full, anyone settles the full table instantly.",
    imageSrc: "/mascots/step-success.png",
    imageAlt: "CakeSplit mascot celebrating a completed table payment",
    accentBg: "bg-[#E63946]/15",
  },
];
