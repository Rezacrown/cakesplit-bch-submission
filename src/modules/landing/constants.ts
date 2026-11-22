export type StorySceneId = "check" | "chip-in" | "protected" | "settled";

export interface StoryScene {
  id: StorySceneId;
  frameNumber: string;
  kicker: string;
  title: string;
  shortLabel: string;
  description: string;
  callout: string;
  mascotSrc: string;
  mascotAlt: string;
  walkPositionPercent: number;
}

export interface FeaturePanel {
  id: string;
  panelNumber: string;
  title: string;
  description: string;
  caption: string;
  imageSrc: string;
  imageAlt: string;
}

export const HERO_COPY = {
  eyebrow: "BITCOIN CASH TABLE SPLIT",
  headlineTop: "Split the table.",
  headlineLead: "Pay the cashier",
  headlineAccent: "in one tap.",
  subtitle:
    "Everyone chips in their slice into one shared pot. Once the check is covered, anyone at the table sends the full bill straight to the cashier.",
  speechBubble: "One check. Zero awkward IOUs.",
  primaryCta: "Start a Split",
  secondaryCta: "Watch the Story",
  trustPoints: [
    "No accounts needed",
    "Zero platform fees",
    "Works with any Bitcoin Cash wallet",
  ],
} as const;

export const STORY_REEL_INTERVAL_MS = 5200;
export const WALK_CYCLE_INTERVAL_MS = 340;

export const STORY_SCENES: StoryScene[] = [
  {
    id: "check",
    frameNumber: "01",
    kicker: "SCENE 01 / SPLIT THE CHECK",
    title: "The Check Drops",
    shortLabel: "The Check Drops",
    description:
      "Enter the cashier address and total bill. Divide the check evenly across the table or give each friend their own custom slice in seconds.",
    callout: "Split evenly or customize every seat",
    mascotSrc: "/mascots/step-split.png",
    mascotAlt: "CakeSplit mascot holding a split receipt for the table",
    walkPositionPercent: 12,
  },
  {
    id: "chip-in",
    frameNumber: "02",
    kicker: "SCENE 02 / SHARED TABLE POT",
    title: "Everyone Chips In",
    shortLabel: "Everyone Chips In",
    description:
      "Share one link or let friends scan across the table. Each person pays their exact slice from whatever Bitcoin Cash wallet they already carry.",
    callout: "Live pot progress fills slice by slice",
    mascotSrc: "/mascots/step-pay.png",
    mascotAlt: "CakeSplit mascot paying a slice from a mobile wallet",
    walkPositionPercent: 37,
  },
  {
    id: "protected",
    frameNumber: "03",
    kicker: "SCENE 03 / BUILT-IN SAFETY",
    title: "Protected Until Full",
    shortLabel: "Protected Until Full",
    description:
      "Plans change? The organizer can cancel before the pot fills up. The instant the full total lands, the pot locks strictly for the cashier.",
    callout: "Cancelable before full, locked once funded",
    mascotSrc: "/mascots/cool.png",
    mascotAlt: "CakeSplit mascot wearing sunglasses beside a monochrome seal",
    walkPositionPercent: 63,
  },
  {
    id: "settled",
    frameNumber: "04",
    kicker: "SCENE 04 / ONE-TAP PAYOUT",
    title: "Settled in One Tap",
    shortLabel: "Settled in One Tap",
    description:
      "Once every slice is in, anyone at the table taps once to pay the cashier directly. Instant Bitcoin Cash settlement with zero platform fees.",
    callout: "Direct payout to the cashier, zero fees",
    mascotSrc: "/mascots/step-success.png",
    mascotAlt: "CakeSplit mascot holding a crisp completion checkmark",
    walkPositionPercent: 88,
  },
];

export const FEATURE_PANELS: FeaturePanel[] = [
  {
    id: "no-fronting",
    panelNumber: "01",
    title: "Nobody fronts the whole bill",
    description:
      "Stop putting dinner on one person's tab and sending awkward reminders later. Every friend contributes their slice right at the table.",
    caption: "NO MORE CHASING IOUS",
    imageSrc: "/mascots/thinking.png",
    imageAlt: "CakeSplit mascot thinking through the dinner split",
  },
  {
    id: "any-wallet",
    panelNumber: "02",
    title: "Works with any Bitcoin Cash wallet",
    description:
      "Friends simply scan or tap the shared table link using the Bitcoin Cash wallet already on their phone — no sign-ups, logins, or new apps.",
    caption: "SCAN AND PAY INSTANTLY",
    imageSrc: "/mascots/step-pay.png",
    imageAlt: "CakeSplit mascot scanning a Bitcoin Cash wallet payment",
  },
  {
    id: "zero-fees",
    panelNumber: "03",
    title: "Zero platform fees, instant settlement",
    description:
      "Every satoshi goes straight from the shared pot to the cashier in one tap. CakeSplit never takes a cut and never holds custody of your money.",
    caption: "DIRECT TO THE CASHIER",
    imageSrc: "/mascots/happy.png",
    imageAlt: "CakeSplit mascot jumping happily after the bill is settled",
  },
];

export const CLOSING_CTA_COPY = {
  stampTop: "CAKESPLIT DINER",
  stampBottom: "ZERO FEES / BITCOIN CASH",
  headline: "Ready to pass the check?",
  description:
    "Create your table split in seconds, share one link around the booth, and settle with the cashier in a single tap.",
  ctaLabel: "Start a Split",
} as const;
