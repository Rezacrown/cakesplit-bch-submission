import {
  binToHex,
  encodeLockingBytecodeP2sh32,
  hexToBin,
  sha256,
} from "@bitauth/libauth";
import {
  buildInvitationCommitSigningPayload,
  convertMnemonicToSeedBytes,
  Crypto,
  verifyInvitationCommitSignature,
  verifyInvitationTransactionBroadcastedResultSignature,
  verifyInvitationTransactionCreatedResultSignature,
} from "@xo-cash/crypto";
import type {
  XOInvitation,
  XOInvitationCommit,
  XOInvitationInput,
  XOInvitationOutput,
  XOInvitationTransactionResult,
  XOInvitationVariable,
} from "@xo-cash/types";
import {
  compileCashAssemblyString,
  deserializeInvitation,
  parseInvitation,
  serializeInvitation,
} from "@xo-cash/utils";
import type { CompiledCakeSplitContract } from "@/lib/bch/cakesplit-contract";
import {
  CAKESPLIT_SETTLEMENT_FEE_SATS,
  CAKESPLIT_TEMPLATE_ID,
  cakeSplitTemplate,
} from "@/lib/xo/cakesplit-template";

export type CakeSplitActionId = "openBill" | "chipIn" | "settleBill" | "cancelBill";
export type CakeSplitRoleId = "organizer" | "contributor" | "settler";

const ACTION_META: Record<
  CakeSplitActionId,
  { role: CakeSplitRoleId; transactionIdentifier: string }
> = {
  openBill: { role: "organizer", transactionIdentifier: "openBillTransaction" },
  chipIn: { role: "contributor", transactionIdentifier: "chipInTransaction" },
  settleBill: { role: "settler", transactionIdentifier: "settleBillTransaction" },
  cancelBill: { role: "organizer", transactionIdentifier: "cancelBillTransaction" },
};

const DEFAULT_EXPIRATION_MS = 24 * 60 * 60 * 1000;

function randomHex(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return binToHex(bytes);
}

/**
 * Derives a valid 64-byte seed for `@xo-cash/crypto` from either a BIP39 mnemonic
 * or a 32-byte organizer private key hex (using SHA-256 domain separation).
 */
export function resolveXoSeedBytes(params: {
  mnemonic?: string;
  privateKeyHex?: string;
}): Uint8Array {
  if (params.mnemonic) {
    return convertMnemonicToSeedBytes(params.mnemonic);
  }
  if (params.privateKeyHex) {
    const privBytes = hexToBin(params.privateKeyHex.trim());
    const left = sha256.hash(
      new Uint8Array([...new TextEncoder().encode("cakesplit:xo-seed:v1:L"), ...privBytes]),
    );
    const right = sha256.hash(
      new Uint8Array([...new TextEncoder().encode("cakesplit:xo-seed:v1:R"), ...privBytes]),
    );
    const seed = new Uint8Array(64);
    seed.set(left, 0);
    seed.set(right, 32);
    return seed;
  }
  const randomSeed = new Uint8Array(64);
  crypto.getRandomValues(randomSeed);
  return randomSeed;
}

/**
 * Compiles `billPotRedeemScript` directly via General Protocols' official
 * `@xo-cash/utils` CashASM compiler (`compileCashAssemblyString`) and wraps it as P2SH32.
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

export interface CakeSplitActionBundle {
  templateIdentifier: string;
  actionIdentifier: CakeSplitActionId;
  roleIdentifier: CakeSplitRoleId;
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
  const { role } = ACTION_META[actionIdentifier];

  const variables: Record<string, string | bigint> = {
    billNonce: contract.billNonceHex,
    merchantLockingScript: contract.merchantLockingHex,
    merchantPayoutSatoshis: contract.merchantPayoutSatoshis,
    organizerPublicKey: contract.organizerPublicKeyHex,
  };

  if (actionIdentifier === "openBill") {
    variables.initialDepositSatoshis =
      params.initialDepositSatoshis ?? contract.potGoalSatoshis;
  } else if (actionIdentifier === "chipIn") {
    variables.currentPotSatoshis = params.currentPotSatoshis ?? 0n;
    variables.contributionSatoshis = params.contributionSatoshis ?? 0n;
  } else if (actionIdentifier === "settleBill") {
    variables.currentPotSatoshis =
      params.currentPotSatoshis ?? contract.potGoalSatoshis;
  } else {
    variables.currentPotSatoshis = params.currentPotSatoshis ?? 0n;
    if (params.refundLockingHex) {
      variables.refundLockingScript = params.refundLockingHex;
    }
  }

  return {
    templateIdentifier: CAKESPLIT_TEMPLATE_ID,
    actionIdentifier,
    roleIdentifier: role,
    variables,
    contractAddress: contract.contractAddress,
    lockingBytecodeHex: contract.lockingBytecodeHex,
    redeemBytecodeHex: contract.redeemBytecodeHex,
    debugToolUrl: "https://blaze.xo.cash/",
  };
}

export interface CreateSignedInvitationParams {
  contract: CompiledCakeSplitContract;
  actionIdentifier: CakeSplitActionId;
  /** Optional BIP39 mnemonic for BIP43 XO key derivation (`m/2415'` / `m/42415'`). */
  mnemonic?: string;
  /** Optional organizer/participant private key hex when mnemonic is not provided. */
  privateKeyHex?: string;
  initialDepositSatoshis?: bigint;
  currentPotSatoshis?: bigint;
  contributionSatoshis?: bigint;
  refundLockingHex?: string;
  /** Optional inputs to include in the commit (e.g., Bill Pot outpoint). */
  inputs?: XOInvitationInput[];
  /** Optional outputs to include in the commit; defaults to canonical action output. */
  outputs?: XOInvitationOutput[];
  /** Optional memo committed inside the Schnorr signature payload. */
  memo?: string;
  /** Optional transaction hash (64-char hex) to attach as a signed XO created/broadcasted result. */
  transactionHash?: string;
  /** Whether `transactionHash` has already been broadcasted to Chipnet/Mainnet. */
  broadcasted?: boolean;
  /** Optional deterministic timestamp (ms) for reproducible builds/tests. */
  nowMs?: number;
}

export interface SignedCakeSplitInvitationResult {
  invitation: XOInvitation;
  serializedJson: string;
  entityIdentifier: string;
  templateIdentifier: string;
  actionIdentifier: CakeSplitActionId;
}

/**
 * Generates a real, cryptographically Schnorr-signed `XOInvitation` using `@xo-cash/crypto`
 * and validates it against General Protocols' `@xo-cash/utils` schema (`parseInvitation`).
 *
 * Works 100% in-browser AND in Node without requiring SQLite or live Electrum bootstrapping,
 * and exports Extended JSON directly inspectable at `https://blaze.xo.cash/`.
 */
export function createSignedCakeSplitInvitation(
  params: CreateSignedInvitationParams,
): SignedCakeSplitInvitationResult {
  const { contract, actionIdentifier } = params;
  const { role, transactionIdentifier } = ACTION_META[actionIdentifier];
  const bundle = buildCakeSplitActionBundle(params);

  const seedBytes = resolveXoSeedBytes({
    mnemonic: params.mnemonic,
    privateKeyHex: params.privateKeyHex,
  });
  const xoCrypto = new Crypto(seedBytes, {
    network: contract.network === "mainnet" ? "mainnet" : "testnet",
  });

  try {
    const now = params.nowMs ?? Date.now();
    const invitationIdentifier = randomHex(16);
    const commitIdentifier = randomHex(16);

    const variables: XOInvitationVariable[] = Object.entries(bundle.variables).map(
      ([variableIdentifier, value]) => ({
        variableIdentifier,
        value,
        roleIdentifier: role,
      }),
    );

    const defaultOutputs: XOInvitationOutput[] =
      params.outputs ??
      (() => {
        if (actionIdentifier === "openBill") {
          return [
            {
              outputIdentifier: "openPotOutput",
              transactionIndex: 0,
              lockingBytecode: contract.lockingBytecode,
              valueSatoshis:
                params.initialDepositSatoshis ?? contract.potGoalSatoshis,
              roleIdentifier: role,
            },
          ];
        }
        if (actionIdentifier === "chipIn") {
          const nextValue =
            (params.currentPotSatoshis ?? 0n) + (params.contributionSatoshis ?? 0n);
          return [
            {
              outputIdentifier: "updatedPotOutput",
              transactionIndex: 0,
              lockingBytecode: contract.lockingBytecode,
              valueSatoshis: nextValue,
              roleIdentifier: role,
            },
          ];
        }
        if (actionIdentifier === "settleBill") {
          const pot = params.currentPotSatoshis ?? contract.potGoalSatoshis;
          const payout =
            pot > contract.settlementFeeSatoshis
              ? pot - contract.settlementFeeSatoshis
              : contract.merchantPayoutSatoshis;
          return [
            {
              outputIdentifier: "merchantPayoutOutput",
              transactionIndex: 0,
              lockingBytecode: contract.merchantLockingBytecode,
              valueSatoshis: payout,
              roleIdentifier: role,
            },
          ];
        }
        const refundHex = params.refundLockingHex ?? contract.merchantLockingHex;
        const pot = params.currentPotSatoshis ?? 0n;
        const refundVal =
          pot > contract.settlementFeeSatoshis
            ? pot - contract.settlementFeeSatoshis
            : pot;
        return [
          {
            outputIdentifier: "refundOutput",
            transactionIndex: 0,
            lockingBytecode: hexToBin(refundHex),
            valueSatoshis: refundVal,
            roleIdentifier: role,
          },
        ];
      })();

    const unsignedCommit: Omit<XOInvitationCommit, "signature" | "entityIdentifier"> = {
      commitIdentifier,
      previousCommitIdentifier: undefined,
      createdAtTimestamp: now,
      expiresAtTimestamp: now + DEFAULT_EXPIRATION_MS,
      ...(params.memo ? { memo: params.memo } : {}),
      data: {
        transactionVersion: 2,
        transactionLocktime: 0,
        roleIdentifier: role,
        variables,
        ...(params.inputs && params.inputs.length > 0 ? { inputs: params.inputs } : {}),
        outputs: defaultOutputs,
      },
    };

    const signedCommit = xoCrypto.signInvitationCommitWithSchnorr({
      invitationCommit: unsignedCommit,
      invitationIdentifier,
      rootCommitIdentifier: commitIdentifier,
      templateIdentifier: CAKESPLIT_TEMPLATE_ID,
      actionIdentifier,
    });

    let result: XOInvitation["result"];
    if (params.transactionHash) {
      const created = xoCrypto.signInvitationTransactionCreatedResult({
        invitationIdentifier,
        templateIdentifier: CAKESPLIT_TEMPLATE_ID,
        rootCommitIdentifier: commitIdentifier,
        transactionHash: params.transactionHash,
        createdAtTimestamp: now,
      });

      let txResult: XOInvitationTransactionResult = created;
      if (params.broadcasted) {
        const broadcastDetails = xoCrypto.signInvitationTransactionBroadcastedResult({
          invitationIdentifier,
          templateIdentifier: CAKESPLIT_TEMPLATE_ID,
          rootCommitIdentifier: commitIdentifier,
          transactionResult: created,
          broadcastedAtTimestamp: now,
        });
        txResult = { ...created, ...broadcastDetails };
      }

      result = {
        transactions: {
          [transactionIdentifier]: txResult,
        },
      };
    }

    const rawInvitation: XOInvitation = {
      invitationIdentifier,
      createdAtTimestamp: now,
      templateIdentifier: CAKESPLIT_TEMPLATE_ID,
      actionIdentifier,
      commits: [signedCommit],
      ...(result ? { result } : {}),
    };

    const validated = parseInvitation(rawInvitation);
    const serializedJson = serializeInvitation(validated);

    return {
      invitation: validated,
      serializedJson,
      entityIdentifier: signedCommit.entityIdentifier,
      templateIdentifier: CAKESPLIT_TEMPLATE_ID,
      actionIdentifier,
    };
  } finally {
    xoCrypto.destroy();
  }
}

export interface InvitationVerificationReport {
  valid: boolean;
  invitation?: XOInvitation;
  error?: string;
}

/**
 * Parses an XO Invitation (object or Extended JSON string) and cryptographically verifies:
 * 1. Official `@xo-cash/utils` schema compliance
 * 2. Matching `CAKESPLIT_TEMPLATE_ID`
 * 3. Every commit's BIP32-derived Schnorr signature
 * 4. Every attached transaction created/broadcasted result Schnorr signature
 */
export function verifyCakeSplitInvitation(
  input: string | XOInvitation,
): InvitationVerificationReport {
  try {
    const invitation =
      typeof input === "string" ? deserializeInvitation(input) : parseInvitation(input);

    if (invitation.templateIdentifier !== CAKESPLIT_TEMPLATE_ID) {
      return {
        valid: false,
        error: `Template ID mismatch: expected ${CAKESPLIT_TEMPLATE_ID}, got ${invitation.templateIdentifier}`,
      };
    }

    for (const commit of invitation.commits) {
      const message = buildInvitationCommitSigningPayload({
        data: commit.data,
        templateIdentifier:
          commit.actionReference?.templateIdentifier ?? invitation.templateIdentifier,
        actionIdentifier:
          commit.actionReference?.actionIdentifier ?? invitation.actionIdentifier,
        invitationIdentifier: invitation.invitationIdentifier,
        commitIdentifier: commit.commitIdentifier,
        previousCommitIdentifier: commit.previousCommitIdentifier,
      });

      const ok = verifyInvitationCommitSignature({
        signature: commit.signature,
        entityIdentifier: commit.entityIdentifier,
        commitIdentifier: commit.commitIdentifier,
        message,
      });

      if (!ok) {
        return {
          valid: false,
          error: `Invalid Schnorr signature on commit ${commit.commitIdentifier}`,
        };
      }
    }

    if (invitation.result?.transactions) {
      for (const [txId, txRes] of Object.entries(invitation.result.transactions)) {
        const createdOk = verifyInvitationTransactionCreatedResultSignature({
          invitationIdentifier: invitation.invitationIdentifier,
          transactionResult: {
            transactionHash: txRes.transactionHash,
            createdAtTimestamp: txRes.createdAtTimestamp,
            createdByEntityIdentifier: txRes.createdByEntityIdentifier,
            createdBySignature: txRes.createdBySignature,
          },
        });
        if (!createdOk) {
          return {
            valid: false,
            error: `Invalid transaction created signature on ${txId}`,
          };
        }

        if ("broadcastedBySignature" in txRes) {
          const broadcastOk = verifyInvitationTransactionBroadcastedResultSignature({
            invitationIdentifier: invitation.invitationIdentifier,
            transactionResult: txRes,
          });
          if (!broadcastOk) {
            return {
              valid: false,
              error: `Invalid transaction broadcast signature on ${txId}`,
            };
          }
        }
      }
    }

    return { valid: true, invitation };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function serializeCakeSplitInvitation(invitation: XOInvitation): string {
  return serializeInvitation(invitation);
}

export function parseCakeSplitInvitation(input: string | XOInvitation): XOInvitation {
  return typeof input === "string"
    ? deserializeInvitation(input)
    : parseInvitation(input);
}
