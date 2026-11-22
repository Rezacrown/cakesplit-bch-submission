export const USD_PER_BCH_REF = 200;

export const COMPATIBLE_WALLETS = ["Cashonize", "Paytaca", "Selene"] as const;

export const OPEN_PROMPT_COPY = {
  eyebrow: "TABLE CHECK",
  title: "Open a Table Check",
  subtitle:
    "Paste any CakeSplit bill link or token from your host to inspect your slice and chip in.",
  placeholder: "Paste a CakeSplit link (https://.../bill?d=...) or token",
  openCta: "Open Table Check",
  createCta: "Create a New Table Check",
} as const;

export const SETTLEMENT_CONSOLE_COPY = {
  heading: "Table Settlement",
  settleCta: "Pay Cashier Now",
  settleCaption:
    "Once the pot reaches 100%, anyone at the table can settle in one tap — no wallet required.",
  cancelCta: "Cancel & Refund Table",
  cancelCaption:
    "Available to the host before the pot is full. Automatically locked once funded.",
  xoLinkTitle: "Inspect Smart Contract & XO Invitations",
  xoLinkSubtitle:
    "Review the P2SH32 covenant, template ID, and Schnorr-signed XO invitations for this table check.",
} as const;
