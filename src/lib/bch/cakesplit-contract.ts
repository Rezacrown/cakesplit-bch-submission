import {
  bigIntToVmNumber,
  binToHex,
  createVirtualMachineBch2026,
  encodeDataPush,
  encodeLockingBytecodeP2sh32,
  encodeTransactionBch,
  flattenBinArray,
  generateSigningSerializationBch,
  hexToBin,
  OpcodesBch2023,
  privateKeyToP2pkhLockingBytecode,
  secp256k1,
  sha256,
  SigningSerializationFlag,
  type Output,
  type TransactionBch,
} from "@bitauth/libauth";
import { scriptToScriptHash } from "@xo-cash/utils";
import {
  cashAddressToLockingHex,
  lockingHexToCashAddress,
  MIN_P2PKH_DUST_SATS,
  type BchNetwork,
} from "@/lib/bch/address";
import { CAKESPLIT_SETTLEMENT_FEE_SATS } from "@/lib/xo/cakesplit-template";

export interface CakeSplitContractParams {
  /** Unique hex salt (e.g., 8-16 bytes hex) distinguishing each split bill on-chain. */
  billNonceHex: string;
  /** Merchant destination CashAddress (Mainnet `bitcoincash:` or Chipnet `bchtest:`). */
  merchantAddress: string;
  /** Minimum net satoshis guaranteed to the merchant upon settlement. */
  merchantPayoutSatoshis: bigint;
  /** Compressed 33-byte hex public key of the organizer (66 hex chars). */
  organizerPublicKeyHex: string;
  /** Target BCH network. */
  network: BchNetwork;
  /** Optional custom settlement fee reserve (defaults to 500 sats). */
  settlementFeeSatoshis?: bigint;
}

export interface CompiledCakeSplitContract {
  billNonceHex: string;
  merchantAddress: string;
  merchantLockingBytecode: Uint8Array;
  merchantLockingHex: string;
  merchantPayoutSatoshis: bigint;
  settlementFeeSatoshis: bigint;
  potGoalSatoshis: bigint;
  organizerPublicKeyHex: string;
  redeemBytecode: Uint8Array;
  redeemBytecodeHex: string;
  lockingBytecode: Uint8Array;
  lockingBytecodeHex: string;
  contractAddress: string;
  scriptHash: string;
  network: BchNetwork;
}

export interface UtxoRef {
  /** Transaction ID in standard display (big-endian) hex order (64 hex chars). */
  txid: string;
  /** Output index (vout). */
  vout: number;
  /** Satoshi value of this UTXO. */
  satoshis: bigint;
}

export interface BuiltCakeSplitTx {
  transaction: TransactionBch;
  sourceOutputs: Output[];
  rawTxHex: string;
  txid: string;
  byteLength: number;
  feeSatoshis: bigint;
}

const OP = OpcodesBch2023;
const SIGHASH_ALL_FORKID =
  SigningSerializationFlag.allOutputs | SigningSerializationFlag.forkId;

function encodeVmIntPush(value: bigint): Uint8Array {
  if (value === 0n) return Uint8Array.of(OP.OP_0);
  if (value >= 1n && value <= 16n) {
    return Uint8Array.of(OP.OP_1 - 1 + Number(value));
  }
  if (value === -1n) return Uint8Array.of(OP.OP_1NEGATE);
  return encodeDataPush(bigIntToVmNumber(value));
}

/**
 * Converts a 64-char display-order (big-endian) txid hex string into the 32-byte
 * `outpointTransactionHash` expected by `@bitauth/libauth`.
 *
 * Note: `libauth`'s `encodeTransactionBch` and `generateSigningSerializationBch`
 * automatically reverse `outpointTransactionHash` to Bitcoin wire (little-endian)
 * byte order—so we must NOT reverse it here.
 */
function txidToOutpointHash(txidHex: string): Uint8Array {
  const bytes = hexToBin(txidHex.trim());
  if (bytes.length !== 32) {
    throw new Error(`Invalid txid hex length: expected 32 bytes, got ${bytes.length}`);
  }
  return bytes;
}

export function computeTxidFromRawBytes(rawTxBytes: Uint8Array): string {
  const doubleHash = sha256.hash(sha256.hash(rawTxBytes));
  return binToHex(new Uint8Array(doubleHash).reverse());
}

/**
 * Deterministically compiles the CakeSplit Bill Pot redeem script and P2SH32 locking script.
 * Byte-for-byte identical to the CashASM in `cakeSplitTemplate.scripts.billPotRedeemScript`.
 */
export function compileCakeSplitContract(
  params: CakeSplitContractParams,
): CompiledCakeSplitContract {
  const billNonceBytes = hexToBin(params.billNonceHex.trim());
  if (billNonceBytes.length === 0 || billNonceBytes.length > 64) {
    throw new Error("billNonceHex must be between 1 and 64 bytes");
  }

  const organizerPubKeyBytes = hexToBin(params.organizerPublicKeyHex.trim());
  if (organizerPubKeyBytes.length !== 33) {
    throw new Error(
      `organizerPublicKeyHex must be a 33-byte compressed pubkey (got ${organizerPubKeyBytes.length} bytes)`,
    );
  }

  if (params.merchantPayoutSatoshis < BigInt(MIN_P2PKH_DUST_SATS)) {
    throw new Error(
      `merchantPayoutSatoshis must be at least ${MIN_P2PKH_DUST_SATS} sats`,
    );
  }

  const settlementFeeSatoshis =
    params.settlementFeeSatoshis ?? CAKESPLIT_SETTLEMENT_FEE_SATS;
  if (settlementFeeSatoshis < 250n) {
    throw new Error("settlementFeeSatoshis must be at least 250 sats");
  }

  const merchantLockingHex = cashAddressToLockingHex(params.merchantAddress);
  const merchantLockingBytecode = hexToBin(merchantLockingHex);

  const redeemBytecode = flattenBinArray([
    // <billNonce> OP_DROP
    encodeDataPush(billNonceBytes),
    Uint8Array.of(OP.OP_DROP),

    // OP_DUP OP_0 OP_NUMEQUAL OP_IF
    Uint8Array.of(OP.OP_DUP, OP.OP_0, OP.OP_NUMEQUAL, OP.OP_IF),
    // Branch 0: chipIn
    Uint8Array.of(
      OP.OP_DROP,
      OP.OP_0,
      OP.OP_OUTPUTBYTECODE,
      OP.OP_INPUTINDEX,
      OP.OP_UTXOBYTECODE,
      OP.OP_EQUALVERIFY,
      OP.OP_0,
      OP.OP_OUTPUTVALUE,
      OP.OP_INPUTINDEX,
      OP.OP_UTXOVALUE,
      OP.OP_GREATERTHAN,
    ),

    // OP_ELSE OP_1 OP_NUMEQUAL OP_IF
    Uint8Array.of(OP.OP_ELSE, OP.OP_1, OP.OP_NUMEQUAL, OP.OP_IF),
    // Branch 1: settleBill
    Uint8Array.of(OP.OP_0, OP.OP_OUTPUTBYTECODE),
    encodeDataPush(merchantLockingBytecode),
    Uint8Array.of(OP.OP_EQUALVERIFY, OP.OP_0, OP.OP_OUTPUTVALUE),
    encodeVmIntPush(params.merchantPayoutSatoshis),
    Uint8Array.of(OP.OP_GREATERTHANOREQUAL),

    // OP_ELSE (Branch 2: cancelBill — only when pot < merchantPayout + settlementFee)
    Uint8Array.of(OP.OP_ELSE, OP.OP_INPUTINDEX, OP.OP_UTXOVALUE),
    encodeVmIntPush(params.merchantPayoutSatoshis),
    encodeVmIntPush(settlementFeeSatoshis),
    Uint8Array.of(OP.OP_ADD, OP.OP_LESSTHAN, OP.OP_VERIFY),
    encodeDataPush(organizerPubKeyBytes),
    Uint8Array.of(OP.OP_CHECKSIG),

    // OP_ENDIF OP_ENDIF
    Uint8Array.of(OP.OP_ENDIF, OP.OP_ENDIF),
  ]);

  const redeemHash = sha256.hash(sha256.hash(redeemBytecode));
  const lockingBytecode = encodeLockingBytecodeP2sh32(redeemHash);
  const lockingBytecodeHex = binToHex(lockingBytecode);
  const contractAddress = lockingHexToCashAddress(
    lockingBytecodeHex,
    params.network,
    false,
  );
  const scriptHash = scriptToScriptHash(lockingBytecode);

  return {
    billNonceHex: binToHex(billNonceBytes),
    merchantAddress: params.merchantAddress.trim(),
    merchantLockingBytecode,
    merchantLockingHex,
    merchantPayoutSatoshis: params.merchantPayoutSatoshis,
    settlementFeeSatoshis,
    potGoalSatoshis: params.merchantPayoutSatoshis + settlementFeeSatoshis,
    organizerPublicKeyHex: binToHex(organizerPubKeyBytes),
    redeemBytecode,
    redeemBytecodeHex: binToHex(redeemBytecode),
    lockingBytecode,
    lockingBytecodeHex,
    contractAddress,
    scriptHash,
    network: params.network,
  };
}

function signSchnorrInput(params: {
  transaction: TransactionBch;
  sourceOutputs: Output[];
  inputIndex: number;
  coveredBytecode: Uint8Array;
  privateKey: Uint8Array;
}): Uint8Array {
  const preimage = generateSigningSerializationBch(
    {
      inputIndex: params.inputIndex,
      sourceOutputs: params.sourceOutputs,
      transaction: params.transaction,
    },
    {
      coveredBytecode: params.coveredBytecode,
      signingSerializationType: Uint8Array.of(SIGHASH_ALL_FORKID),
    },
  );
  const digest = sha256.hash(sha256.hash(preimage));
  const sig = secp256k1.signMessageHashSchnorr(params.privateKey, digest);
  if (typeof sig === "string") {
    throw new Error(`Schnorr signing failed: ${sig}`);
  }
  return flattenBinArray([sig, Uint8Array.of(SIGHASH_ALL_FORKID)]);
}

/**
 * Verifies every input of a built transaction against the official BCH 2026 VM (`libauth`).
 * Returns `{ ok: true }` if every single input passes cleanly; otherwise returns the VM error.
 */
export function verifyTransactionWithBchVm(
  transaction: TransactionBch,
  sourceOutputs: Output[],
): { ok: true } | { ok: false; error: string } {
  const vm = createVirtualMachineBch2026();
  const result = vm.verify({
    sourceOutputs,
    transaction,
  });
  if (result !== true) {
    return {
      ok: false,
      error: typeof result === "string" ? result : "VM verification failed",
    };
  }
  return { ok: true };
}

/**
 * Estimates a safe miner fee (`>= 1.1 sat/byte`, minimum 250 sats) for a transaction byte size.
 */
export function calculateSafeMinerFee(byteLength: number): bigint {
  const scaled = BigInt(Math.ceil(byteLength * 1.15));
  return scaled > 250n ? scaled : 250n;
}

/**
 * Builds a permissionless `settleBill` transaction (0 signatures!) sweeping 1 or more
 * Bill Pot UTXOs directly to the locked `merchantLockingBytecode`.
 *
 * Works for BOTH:
 * - Single-UTXO XO accumulator flow (`openBill` -> `chipIn` -> `settleBill`)
 * - Multi-UTXO QR scan flow (multiple friends scanning BIP21 QR codes to the contract address)
 */
export function buildSettleBillTransaction(params: {
  contract: CompiledCakeSplitContract;
  potUtxos: UtxoRef[];
  /** Optional explicit miner fee; if omitted, dynamically sized for 1..N inputs. */
  minerFeeSatoshis?: bigint;
}): BuiltCakeSplitTx & { merchantPaidSatoshis: bigint; sweptUtxoCount: number } {
  const { contract, potUtxos } = params;
  if (potUtxos.length === 0) {
    throw new Error("At least one Bill Pot UTXO is required to settle");
  }

  const totalInputSatoshis = potUtxos.reduce((sum, u) => sum + u.satoshis, 0n);
  const unlockingBytecode = flattenBinArray([
    Uint8Array.of(OP.OP_1),
    encodeDataPush(contract.redeemBytecode),
  ]);

  const inputs = potUtxos.map((utxo) => ({
    outpointIndex: utxo.vout,
    outpointTransactionHash: txidToOutpointHash(utxo.txid),
    sequenceNumber: 0xffffffff,
    unlockingBytecode,
  }));

  const sourceOutputs: Output[] = potUtxos.map((utxo) => ({
    lockingBytecode: contract.lockingBytecode,
    valueSatoshis: utxo.satoshis,
  }));

  // First pass to measure exact serialized byte length for dynamic fee sizing.
  const probeTx: TransactionBch = {
    version: 2,
    locktime: 0,
    inputs,
    outputs: [
      {
        lockingBytecode: contract.merchantLockingBytecode,
        valueSatoshis: contract.merchantPayoutSatoshis,
      },
    ],
  };
  const byteLength = encodeTransactionBch(probeTx).length;
  const feeSatoshis =
    params.minerFeeSatoshis ??
    (calculateSafeMinerFee(byteLength) > contract.settlementFeeSatoshis
      ? calculateSafeMinerFee(byteLength)
      : contract.settlementFeeSatoshis);

  const merchantPaidSatoshis = totalInputSatoshis - feeSatoshis;
  if (merchantPaidSatoshis < contract.merchantPayoutSatoshis) {
    throw new Error(
      `Insufficient Bill Pot balance: have ${totalInputSatoshis} sats, need at least ${contract.merchantPayoutSatoshis + feeSatoshis} sats (payout ${contract.merchantPayoutSatoshis} + fee ${feeSatoshis})`,
    );
  }

  const transaction: TransactionBch = {
    ...probeTx,
    outputs: [
      {
        lockingBytecode: contract.merchantLockingBytecode,
        valueSatoshis: merchantPaidSatoshis,
      },
    ],
  };

  const rawBytes = encodeTransactionBch(transaction);
  return {
    transaction,
    sourceOutputs,
    rawTxHex: binToHex(rawBytes),
    txid: computeTxidFromRawBytes(rawBytes),
    byteLength: rawBytes.length,
    feeSatoshis,
    merchantPaidSatoshis,
    sweptUtxoCount: potUtxos.length,
  };
}

/**
 * Builds a `chipIn` transaction (Branch 0) spending the current Bill Pot UTXO + a contributor's
 * P2PKH funding UTXO, outputting an increased Bill Pot UTXO at output 0 (plus change if above dust).
 */
export function buildChipInTransaction(params: {
  contract: CompiledCakeSplitContract;
  potUtxo: UtxoRef;
  contributorUtxo: UtxoRef;
  contributorPrivateKey: Uint8Array;
  contributionSatoshis: bigint;
  /** Optional change address; defaults to contributor's own P2PKH address. */
  changeAddress?: string;
  /** Optional explicit miner fee; if omitted, dynamically calculated (>= 1.15 sat/byte). */
  minerFeeSatoshis?: bigint;
}): BuiltCakeSplitTx & { newPotSatoshis: bigint; changeSatoshis: bigint } {
  const {
    contract,
    potUtxo,
    contributorUtxo,
    contributorPrivateKey,
    contributionSatoshis,
  } = params;

  if (contributionSatoshis <= 0n) {
    throw new Error("contributionSatoshis must be greater than 0");
  }

  const contributorPubKey = secp256k1.derivePublicKeyCompressed(contributorPrivateKey);
  if (typeof contributorPubKey === "string") {
    throw new Error(`Invalid contributor private key: ${contributorPubKey}`);
  }

  const contributorLockingBytecode = privateKeyToP2pkhLockingBytecode({
    privateKey: contributorPrivateKey,
  });
  if (typeof contributorLockingBytecode === "string") {
    throw new Error(`Invalid contributor locking bytecode: ${contributorLockingBytecode}`);
  }

  const changeLockingBytecode = params.changeAddress
    ? hexToBin(cashAddressToLockingHex(params.changeAddress))
    : contributorLockingBytecode;

  const potUnlockingBytecode = flattenBinArray([
    Uint8Array.of(OP.OP_0),
    encodeDataPush(contract.redeemBytecode),
  ]);

  const newPotSatoshis = potUtxo.satoshis + contributionSatoshis;
  const sourceOutputs: Output[] = [
    {
      lockingBytecode: contract.lockingBytecode,
      valueSatoshis: potUtxo.satoshis,
    },
    {
      lockingBytecode: contributorLockingBytecode,
      valueSatoshis: contributorUtxo.satoshis,
    },
  ];

  // Probe with placeholder 65-byte sig + 33-byte pubkey unlocking bytecode to measure exact fee.
  const dummyP2pkhUnlock = new Uint8Array(1 + 65 + 1 + 33);
  const probeOutputs: Output[] = [
    {
      lockingBytecode: contract.lockingBytecode,
      valueSatoshis: newPotSatoshis,
    },
    {
      lockingBytecode: changeLockingBytecode,
      valueSatoshis: BigInt(MIN_P2PKH_DUST_SATS),
    },
  ];
  const probeTx: TransactionBch = {
    version: 2,
    locktime: 0,
    inputs: [
      {
        outpointIndex: potUtxo.vout,
        outpointTransactionHash: txidToOutpointHash(potUtxo.txid),
        sequenceNumber: 0xffffffff,
        unlockingBytecode: potUnlockingBytecode,
      },
      {
        outpointIndex: contributorUtxo.vout,
        outpointTransactionHash: txidToOutpointHash(contributorUtxo.txid),
        sequenceNumber: 0xffffffff,
        unlockingBytecode: dummyP2pkhUnlock,
      },
    ],
    outputs: probeOutputs,
  };

  const estimatedFee =
    params.minerFeeSatoshis ?? calculateSafeMinerFee(encodeTransactionBch(probeTx).length);
  const rawChange = contributorUtxo.satoshis - contributionSatoshis - estimatedFee;
  if (rawChange < 0n) {
    throw new Error(
      `Insufficient contributor UTXO: have ${contributorUtxo.satoshis} sats, need ${contributionSatoshis + estimatedFee} sats`,
    );
  }

  const hasChangeOutput = rawChange >= BigInt(MIN_P2PKH_DUST_SATS);
  const finalChangeSatoshis = hasChangeOutput ? rawChange : 0n;
  const finalFeeSatoshis = hasChangeOutput ? estimatedFee : estimatedFee + rawChange;

  const outputs: Output[] = [
    {
      lockingBytecode: contract.lockingBytecode,
      valueSatoshis: newPotSatoshis,
    },
  ];
  if (hasChangeOutput) {
    outputs.push({
      lockingBytecode: changeLockingBytecode,
      valueSatoshis: finalChangeSatoshis,
    });
  }

  const unsignedTx: TransactionBch = {
    ...probeTx,
    outputs,
  };

  const contributorSig = signSchnorrInput({
    transaction: unsignedTx,
    sourceOutputs,
    inputIndex: 1,
    coveredBytecode: contributorLockingBytecode,
    privateKey: contributorPrivateKey,
  });

  const contributorUnlockingBytecode = flattenBinArray([
    encodeDataPush(contributorSig),
    encodeDataPush(contributorPubKey),
  ]);

  const transaction: TransactionBch = {
    ...unsignedTx,
    inputs: [
      unsignedTx.inputs[0],
      {
        ...unsignedTx.inputs[1],
        unlockingBytecode: contributorUnlockingBytecode,
      },
    ],
  };

  const rawBytes = encodeTransactionBch(transaction);
  return {
    transaction,
    sourceOutputs,
    rawTxHex: binToHex(rawBytes),
    txid: computeTxidFromRawBytes(rawBytes),
    byteLength: rawBytes.length,
    feeSatoshis: finalFeeSatoshis,
    newPotSatoshis,
    changeSatoshis: finalChangeSatoshis,
  };
}

/**
 * Builds an organizer-signed `cancelBill` transaction (Branch 2) reclaiming funds from
 * an incomplete Bill Pot (`UTXOVALUE < merchantPayoutSatoshis + settlementFeeSatoshis`).
 *
 * If any pot UTXO is already `>= potGoalSatoshis`, the BCH VM cryptographically rejects cancel!
 */
export function buildCancelBillTransaction(params: {
  contract: CompiledCakeSplitContract;
  potUtxos: UtxoRef[];
  organizerPrivateKey: Uint8Array;
  refundAddress: string;
  minerFeeSatoshis?: bigint;
}): BuiltCakeSplitTx & { refundedSatoshis: bigint } {
  const { contract, potUtxos, organizerPrivateKey, refundAddress } = params;
  if (potUtxos.length === 0) {
    throw new Error("At least one Bill Pot UTXO is required to cancel");
  }

  const totalInputSatoshis = potUtxos.reduce((sum, u) => sum + u.satoshis, 0n);
  const refundLockingBytecode = hexToBin(cashAddressToLockingHex(refundAddress));

  const sourceOutputs: Output[] = potUtxos.map((utxo) => ({
    lockingBytecode: contract.lockingBytecode,
    valueSatoshis: utxo.satoshis,
  }));

  // Placeholder unlocking bytecode per input: <65-byte sig> OP_2 <redeemScript>
  const placeholderUnlock = flattenBinArray([
    encodeDataPush(new Uint8Array(65)),
    Uint8Array.of(OP.OP_2),
    encodeDataPush(contract.redeemBytecode),
  ]);

  const baseInputs = potUtxos.map((utxo) => ({
    outpointIndex: utxo.vout,
    outpointTransactionHash: txidToOutpointHash(utxo.txid),
    sequenceNumber: 0xffffffff,
    unlockingBytecode: placeholderUnlock,
  }));

  const probeTx: TransactionBch = {
    version: 2,
    locktime: 0,
    inputs: baseInputs,
    outputs: [
      {
        lockingBytecode: refundLockingBytecode,
        valueSatoshis: BigInt(MIN_P2PKH_DUST_SATS),
      },
    ],
  };

  const feeSatoshis =
    params.minerFeeSatoshis ?? calculateSafeMinerFee(encodeTransactionBch(probeTx).length);
  const refundedSatoshis = totalInputSatoshis - feeSatoshis;
  if (refundedSatoshis < BigInt(MIN_P2PKH_DUST_SATS)) {
    throw new Error(
      `Bill Pot balance (${totalInputSatoshis} sats) is too small to cover miner fee (${feeSatoshis} sats) and dust limit`,
    );
  }

  const unsignedTx: TransactionBch = {
    ...probeTx,
    outputs: [
      {
        lockingBytecode: refundLockingBytecode,
        valueSatoshis: refundedSatoshis,
      },
    ],
  };

  const signedInputs = unsignedTx.inputs.map((input, inputIndex) => {
    const sig = signSchnorrInput({
      transaction: unsignedTx,
      sourceOutputs,
      inputIndex,
      coveredBytecode: contract.redeemBytecode,
      privateKey: organizerPrivateKey,
    });
    return {
      ...input,
      unlockingBytecode: flattenBinArray([
        encodeDataPush(sig),
        Uint8Array.of(OP.OP_2),
        encodeDataPush(contract.redeemBytecode),
      ]),
    };
  });

  const transaction: TransactionBch = {
    ...unsignedTx,
    inputs: signedInputs,
  };

  const rawBytes = encodeTransactionBch(transaction);
  return {
    transaction,
    sourceOutputs,
    rawTxHex: binToHex(rawBytes),
    txid: computeTxidFromRawBytes(rawBytes),
    byteLength: rawBytes.length,
    feeSatoshis,
    refundedSatoshis,
  };
}
