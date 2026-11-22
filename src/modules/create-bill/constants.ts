export const SETTLEMENT_FEE_SATS = 500;
export const MIN_PARTICIPANTS = 2;
export const MAX_PARTICIPANTS = 12;
export const MIN_SLICE_SATS = 1_000;

export type SplitMode = "equal" | "custom";
export type InputCurrencyUnit = "usd" | "bch";

export const CREATE_PAGE_COPY = {
  eyebrow: "NEW TABLE CHECK",
  title: "Create a Table Check",
  subtitle:
    "Set the total in USD or BCH, add your friends, and share one Bitcoin Cash Mainnet payment link.",
} as const;

export interface TrustGuarantee {
  id: "pot" | "settle" | "cancel";
  title: string;
  description: string;
}

export const TRUST_GUARANTEES: TrustGuarantee[] = [
  {
    id: "pot",
    title: "One shared pot",
    description:
      "Friends pay their slice straight from any Bitcoin Cash wallet.",
  },
  {
    id: "settle",
    title: "One-tap cashier payout",
    description:
      "Once full, anyone at the table settles straight to the cashier.",
  },
  {
    id: "cancel",
    title: "Cancel safety built in",
    description:
      "Available before the pot is full and automatically locked once funded.",
  },
];
