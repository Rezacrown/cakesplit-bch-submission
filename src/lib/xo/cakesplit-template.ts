import type { XOTemplate } from "@xo-cash/types";
import {
  generateTemplateIdentifier,
  parseTemplate,
  serializeTemplate,
} from "@xo-cash/utils";

/**
 * Fixed satoshi buffer collected inside the Bill Pot so `settleBill` can execute
 * permissionlessly with 0 signatures and 0 extra wallet inputs (1-in / N-in -> 1-out).
 */
export const CAKESPLIT_SETTLEMENT_FEE_SATS = 500n;

/**
 * Minimum dust floor for a covenant UTXO on Bitcoin Cash.
 */
export const CAKESPLIT_MIN_POT_SATS = 1_000n;

/**
 * CakeSplit — Trustless On-Chain Split Bill (XO Template)
 *
 * Locking Type: `p2sh` (XO automatically wraps `billPotRedeemScript` as P2SH32).
 *
 * Spend paths (branch selector pushed by unlocking script):
 *   0 (`chipIn`)     — Permissionless: returns output 0 to the exact same covenant
 *                      bytecode with strictly higher satoshi balance.
 *   1 (`settleBill`) — Permissionless (0 signatures): pays output 0 >= `merchantPayoutSatoshis`
 *                      to the locked `merchantLockingScript`.
 *   2 (`cancelBill`) — Organizer only BEFORE pot reaches full goal
 *                      (`UTXOVALUE < merchantPayoutSatoshis + settlementFeeSatoshis`)
 *                      with a valid Schnorr signature from `organizerPublicKey`.
 */
const rawCakeSplitTemplate: XOTemplate = {
  $schema: "https://libauth.org/schemas/wallet-template-v0.schema.json",
  name: "CakeSplit — On-Chain Split Bill",
  description:
    "Trustless group split-bill covenant on Bitcoin Cash. Friends chip into one locked pot that only pays the merchant once full, and blocks organizer cancellation once funded.",
  icon: "split",
  version: "1",
  supported: ["BCH_2023_05", "BCH_2024_05", "BCH_2025_05", "BCH_2026_05"],
  resources: [
    {
      name: "CakeSplit Repository",
      description: "Source code, tests, and BCH BLAZE 2026 documentation for CakeSplit.",
      url: "https://github.com/Rezacrown/bch-blaze-hackathon",
    },
  ],
  roles: {
    organizer: {
      name: "Organizer",
      description:
        "Creates the split bill, locks the merchant destination and target amount, and can cancel only before the pot is full.",
      icon: "organizer",
    },
    contributor: {
      name: "Contributor",
      description:
        "A group member contributing their share into the Bill Pot covenant.",
      icon: "contributor",
    },
    settler: {
      name: "Settler",
      description:
        "Any participant or merchant triggering permissionless settlement once the pot reaches the target.",
      icon: "settler",
    },
  },
  start: [
    {
      action: "openBill",
      role: "organizer",
      generate: ["organizerKey"],
    },
  ],
  actions: {
    openBill: {
      name: "Open Split Bill",
      description:
        "Create a new Bill Pot covenant locked to the merchant address and target payout, seeded with the initial deposit.",
      icon: "open",
      roles: {
        organizer: {
          name: "Open Split Bill",
          description:
            "Generate the organizer key and deposit the initial share into the Bill Pot.",
          icon: "organizer",
          generate: ["organizerKey"],
          requirements: {
            variables: [
              "billNonce",
              "merchantLockingScript",
              "merchantPayoutSatoshis",
              "organizerPublicKey",
              "initialDepositSatoshis",
            ],
          },
        },
      },
      requirements: {
        participants: [
          {
            role: "organizer",
            slots: { min: 1, max: 1 },
          },
        ],
      },
      transaction: "openBillTransaction",
    },
    chipIn: {
      name: "Chip In Share",
      description:
        "Add a contributor's share to the existing Bill Pot while preserving the exact covenant locking script.",
      icon: "chipin",
      roles: {
        contributor: {
          name: "Chip In Share",
          description: "Contribute satoshis to increase the Bill Pot balance.",
          icon: "contributor",
          requirements: {
            variables: ["currentPotSatoshis", "contributionSatoshis"],
          },
        },
      },
      requirements: {
        variables: [
          "billNonce",
          "merchantLockingScript",
          "merchantPayoutSatoshis",
          "organizerPublicKey",
        ],
        participants: [
          {
            role: "contributor",
            slots: { min: 1, max: 1 },
          },
        ],
      },
      transaction: "chipInTransaction",
    },
    settleBill: {
      name: "Settle & Pay Merchant",
      description:
        "Permissionlessly pay the locked merchant address once the Bill Pot holds the full payout plus settlement fee buffer.",
      icon: "settle",
      roles: {
        settler: {
          name: "Settle & Pay Merchant",
          description: "Broadcast the signature-free settlement payout to the merchant.",
          icon: "settler",
          requirements: {
            variables: ["currentPotSatoshis"],
          },
        },
      },
      requirements: {
        variables: [
          "billNonce",
          "merchantLockingScript",
          "merchantPayoutSatoshis",
          "organizerPublicKey",
        ],
        participants: [
          {
            role: "settler",
            slots: { min: 1, max: 1 },
          },
        ],
      },
      conditions: [
        "$(OP_INPUTINDEX OP_UTXOVALUE <merchantPayoutSatoshis> <settlementFeeSatoshis> OP_ADD OP_GREATERTHANOREQUAL)",
      ],
      transaction: "settleBillTransaction",
    },
    cancelBill: {
      name: "Cancel & Refund Bill",
      description:
        "Organizer-only escape hatch to cancel an incomplete bill and reclaim funds before the pot reaches full funding.",
      icon: "cancel",
      roles: {
        organizer: {
          name: "Cancel & Refund Bill",
          description:
            "Sign with the organizer key to refund the pot before the bill target is reached.",
          icon: "organizer",
          requirements: {
            secrets: ["organizerKey"],
            variables: ["currentPotSatoshis", "refundLockingScript"],
          },
        },
      },
      requirements: {
        variables: [
          "billNonce",
          "merchantLockingScript",
          "merchantPayoutSatoshis",
          "organizerPublicKey",
        ],
        participants: [
          {
            role: "organizer",
            slots: { min: 1, max: 1 },
          },
        ],
      },
      conditions: [
        "$(OP_INPUTINDEX OP_UTXOVALUE <merchantPayoutSatoshis> <settlementFeeSatoshis> OP_ADD OP_LESSTHAN)",
      ],
      transaction: "cancelBillTransaction",
    },
  },
  transactions: {
    openBillTransaction: {
      name: "Split Bill Opened",
      description:
        "Opened a CakeSplit Bill Pot with $(<initialDepositSatoshis>) satoshis toward a $(<merchantPayoutSatoshis>) satoshi bill.",
      icon: "open",
      inputs: [],
      outputs: [
        {
          output: "openPotOutput",
          outputIndex: 0,
        },
      ],
      version: 2,
      locktime: 0,
      composable: true,
    },
    chipInTransaction: {
      name: "Share Contributed",
      description:
        "Added $(<contributionSatoshis>) satoshis to the CakeSplit Bill Pot.",
      icon: "chipin",
      inputs: [
        {
          input: "chipInPotInput",
          inputIndex: 0,
        },
      ],
      outputs: [
        {
          output: "updatedPotOutput",
          outputIndex: 0,
        },
      ],
      version: 2,
      locktime: 0,
      composable: true,
    },
    settleBillTransaction: {
      name: "Bill Settled to Merchant",
      description:
        "Paid $(<merchantPayoutSatoshis>) satoshis directly to the locked merchant address.",
      icon: "settle",
      inputs: [
        {
          input: "settlePotInput",
          inputIndex: 0,
        },
      ],
      outputs: [
        {
          output: "merchantPayoutOutput",
          outputIndex: 0,
        },
      ],
      version: 2,
      locktime: 0,
      composable: false,
    },
    cancelBillTransaction: {
      name: "Split Bill Cancelled",
      description: "Organizer cancelled an incomplete CakeSplit Bill Pot and refunded funds.",
      icon: "cancel",
      inputs: [
        {
          input: "cancelPotInput",
          inputIndex: 0,
        },
      ],
      outputs: [
        {
          output: "refundOutput",
          outputIndex: 0,
        },
      ],
      version: 2,
      locktime: 0,
      composable: false,
    },
  },
  inputs: {
    chipInPotInput: {
      name: "Current Bill Pot",
      description: "Spends the active Bill Pot UTXO via the permissionless chipIn branch.",
      icon: "chipin",
      valueSatoshis: "$(<currentPotSatoshis>)",
      token: null,
      unlockingScript: "unlockChipIn",
    },
    settlePotInput: {
      name: "Funded Bill Pot",
      description: "Spends the funded Bill Pot UTXO via the permissionless settleBill branch.",
      icon: "settle",
      valueSatoshis: "$(<currentPotSatoshis>)",
      token: null,
      unlockingScript: "unlockSettleBill",
    },
    cancelPotInput: {
      name: "Incomplete Bill Pot",
      description: "Spends an underfunded Bill Pot UTXO with the organizer signature.",
      icon: "cancel",
      valueSatoshis: "$(<currentPotSatoshis>)",
      token: null,
      unlockingScript: "unlockCancelBill",
    },
  },
  outputs: {
    openPotOutput: {
      name: "Bill Pot",
      description: "Initial CakeSplit Bill Pot output locked to the split-bill covenant.",
      icon: "split",
      lockingScript: "billPotLockingScript",
      valueSatoshis: "$(<initialDepositSatoshis>)",
      token: null,
    },
    updatedPotOutput: {
      name: "Updated Bill Pot",
      description:
        "Bill Pot output carrying the previous balance plus the new contribution.",
      icon: "chipin",
      lockingScript: "billPotLockingScript",
      valueSatoshis: "$(nextPotSatoshis)",
      token: null,
    },
    merchantPayoutOutput: {
      name: "Merchant Payout",
      description: "Final bill settlement paid directly to the merchant.",
      icon: "settle",
      lockingScript: "$(<merchantLockingScript>)",
      valueSatoshis: "$(settlePayoutSatoshis)",
      token: null,
    },
    refundOutput: {
      name: "Organizer Refund",
      description: "Returned satoshis after cancelling an incomplete bill.",
      icon: "cancel",
      lockingScript: "$(<refundLockingScript>)",
      valueSatoshis: "$(refundSatoshis)",
      token: null,
    },
  },
  lockingScripts: {
    billPotLockingScript: {
      name: "CakeSplit Bill Pot Covenant",
      description:
        "P2SH32 covenant enforcing monotonic contributions, locked merchant payout, and pre-full-only organizer cancel.",
      icon: "split",
      lockingType: "p2sh",
      lockingBytecode: "billPotRedeemScript",
      state: {
        variables: [
          "billNonce",
          "merchantLockingScript",
          "merchantPayoutSatoshis",
          "organizerPublicKey",
        ],
      },
      actions: [
        {
          action: "chipIn",
          role: "contributor",
        },
        {
          action: "settleBill",
          role: "settler",
        },
      ],
      selectable: false,
      roles: {
        organizer: {
          state: {
            secrets: ["organizerKey"],
          },
          actions: [
            {
              action: "chipIn",
              role: "contributor",
            },
            {
              action: "settleBill",
              role: "settler",
            },
            {
              action: "cancelBill",
              role: "organizer",
              secrets: [{ organizerKey: null }],
            },
          ],
          balance: {
            satoshis: true,
          },
        },
        contributor: {
          actions: [
            {
              action: "chipIn",
              role: "contributor",
            },
            {
              action: "settleBill",
              role: "settler",
            },
          ],
          relevant: true,
        },
        settler: {
          actions: [
            {
              action: "settleBill",
              role: "settler",
            },
          ],
          relevant: true,
        },
      },
    },
  },
  scripts: {
    nextPotSatoshis: "<currentPotSatoshis> <contributionSatoshis> OP_ADD",
    settlePayoutSatoshis: "<currentPotSatoshis> <settlementFeeSatoshis> OP_SUB",
    refundSatoshis: "<currentPotSatoshis> <settlementFeeSatoshis> OP_SUB",
    enforceSameCovenant:
      "OP_0 OP_OUTPUTBYTECODE OP_INPUTINDEX OP_UTXOBYTECODE OP_EQUALVERIFY",
    enforcePotGrows:
      "OP_0 OP_OUTPUTVALUE OP_INPUTINDEX OP_UTXOVALUE OP_GREATERTHAN",
    enforceMerchantDestination:
      "OP_0 OP_OUTPUTBYTECODE <merchantLockingScript> OP_EQUALVERIFY",
    enforceMerchantAmount:
      "OP_0 OP_OUTPUTVALUE <merchantPayoutSatoshis> OP_GREATERTHANOREQUAL",
    enforceNotYetFull:
      "OP_INPUTINDEX OP_UTXOVALUE <merchantPayoutSatoshis> <settlementFeeSatoshis> OP_ADD OP_LESSTHAN OP_VERIFY",
    billPotRedeemScript: [
      "<billNonce> OP_DROP",
      "OP_DUP OP_0 OP_NUMEQUAL",
      "OP_IF",
      "OP_DROP",
      "enforceSameCovenant",
      "enforcePotGrows",
      "OP_ELSE",
      "OP_1 OP_NUMEQUAL",
      "OP_IF",
      "enforceMerchantDestination",
      "enforceMerchantAmount",
      "OP_ELSE",
      "enforceNotYetFull",
      "<organizerPublicKey> OP_CHECKSIG",
      "OP_ENDIF",
      "OP_ENDIF",
    ].join(" "),
    unlockChipIn: "OP_0",
    unlockSettleBill: "OP_1",
    unlockCancelBill: "<organizerKey.schnorr_signature.all_outputs> OP_2",
  },
  constants: {
    settlementFeeSatoshis: {
      name: "Settlement Fee Buffer",
      description:
        "Fixed satoshi reserve so permissionless settlement pays its own network fee without extra inputs.",
      type: "satoshis",
      value: CAKESPLIT_SETTLEMENT_FEE_SATS,
    },
  },
  variables: {
    billNonce: {
      name: "Bill Nonce",
      description: "Unique byte identifier distinguishing this split bill on-chain.",
      type: "bytes",
    },
    merchantLockingScript: {
      name: "Merchant Locking Script",
      description: "Locking bytecode of the merchant or recipient who receives the settled bill.",
      type: "locking_script",
    },
    merchantPayoutSatoshis: {
      name: "Merchant Payout Target",
      description: "Minimum net satoshis the merchant must receive upon settlement.",
      type: "satoshis",
    },
    organizerKey: {
      name: "Organizer Key",
      description: "Private key held by the bill organizer to authorize pre-full cancellation.",
      type: "private_key",
    },
    organizerPublicKey: {
      name: "Organizer Public Key",
      description: "Compressed 33-byte public key of the bill organizer.",
      type: "public_key",
    },
    initialDepositSatoshis: {
      name: "Initial Deposit",
      description: "Satoshis locked into the Bill Pot when opening the bill.",
      type: "satoshis",
    },
    currentPotSatoshis: {
      name: "Current Pot Balance",
      description: "Satoshis currently held in the Bill Pot UTXO being spent.",
      type: "satoshis",
    },
    contributionSatoshis: {
      name: "Contribution Amount",
      description: "Additional satoshis a participant adds to the Bill Pot.",
      type: "satoshis",
    },
    refundLockingScript: {
      name: "Refund Destination",
      description: "Locking bytecode receiving reclaimed funds when an incomplete bill is cancelled.",
      type: "locking_script",
    },
  },
  icons: [
    { name: "split", hash: "0000000000000000000000" },
    { name: "organizer", hash: "0000000000000000000000" },
    { name: "contributor", hash: "0000000000000000000000" },
    { name: "settler", hash: "0000000000000000000000" },
    { name: "open", hash: "0000000000000000000000" },
    { name: "chipin", hash: "0000000000000000000000" },
    { name: "settle", hash: "0000000000000000000000" },
    { name: "cancel", hash: "0000000000000000000000" },
  ],
};

/**
 * Validated canonical CakeSplit XO Template (checked via `@xo-cash/utils` `parseTemplate`).
 */
export const cakeSplitTemplate: XOTemplate = parseTemplate(rawCakeSplitTemplate);

/**
 * Canonical SHA-256 XO Template Identifier for CakeSplit.
 */
export const CAKESPLIT_TEMPLATE_ID: string =
  generateTemplateIdentifier(cakeSplitTemplate);

/**
 * Export Extended JSON string of the CakeSplit XO Template for `blaze.xo.cash` import.
 */
export function serializeCakeSplitTemplate(): string {
  return serializeTemplate(cakeSplitTemplate);
}
