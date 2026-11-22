import { hexToBin } from "@bitauth/libauth";
import {
  broadcastRawTransaction,
  buildCancelBillTransaction,
  buildSettleBillTransaction,
  cashAddressToLockingHex,
  fetchContractPotState,
  getExplorerTxUrl,
  isValidCashAddress,
  verifyTransactionWithBchVm,
  type CompiledCakeSplitContract,
  type ContractPotState,
  type OnChainUtxo,
} from "@/lib/bch";
import { createSignedCakeSplitInvitation } from "@/lib/xo";
export { buildReceiptFromOnChainResolution } from "@/services/client/receiptResolution";

export interface ReceiptHistoryEntry {
  txid: string;
  explorerUrl: string;
  role: "deposit" | "settlement" | "refund";
  isUnconfirmed: boolean;
}

export interface SettleBillBroadcastResult {
  kind: "settled";
  txid: string;
  explorerUrl: string;
  merchantPaidSatoshis: bigint;
  feeSatoshis: bigint;
  sweptUtxoCount: number;
  invitationJson: string;
  broadcastedAt: number;
  historyEntries?: ReceiptHistoryEntry[];
}

export interface CancelBillBroadcastResult {
  kind: "cancelled";
  txid: string;
  explorerUrl: string;
  refundAddress: string;
  refundedSatoshis: bigint;
  feeSatoshis: bigint;
  invitationJson: string;
  broadcastedAt: number;
  historyEntries?: ReceiptHistoryEntry[];
}

export type BroadcastReceipt =
  | SettleBillBroadcastResult
  | CancelBillBroadcastResult;

/**
 * Fetches live Bill Pot UTXOs (confirmed + 0-conf mempool) and settled/cancelled
 * on-chain history via Fulcrum WSS.
 */
export async function fetchLiveBillPot(
  contract: CompiledCakeSplitContract,
): Promise<ContractPotState> {
  return fetchContractPotState(contract);
}

/**
 * Builds, pre-flight verifies against the BCH 2026 VM, broadcasts a permissionless
 * `settleBill` transaction, and produces a Schnorr-signed broadcasted XO Invitation.
 */
export async function executeSettleBillAction(
  contract: CompiledCakeSplitContract,
  utxos: OnChainUtxo[],
  billTitle?: string,
): Promise<SettleBillBroadcastResult> {
  const built = buildSettleBillTransaction({
    contract,
    potUtxos: utxos,
  });

  const vmCheck = verifyTransactionWithBchVm(
    built.transaction,
    built.sourceOutputs,
  );
  if (!vmCheck.ok) {
    throw new Error(
      `Pre-flight BCH VM rejected settlement transaction: ${vmCheck.error}`,
    );
  }

  const txid = await broadcastRawTransaction(built.rawTxHex, contract.network);
  const totalPotSatoshis = utxos.reduce((sum, u) => sum + u.satoshis, 0n);
  const invitation = createSignedCakeSplitInvitation({
    contract,
    actionIdentifier: "settleBill",
    currentPotSatoshis: totalPotSatoshis,
    outputs: [
      {
        outputIdentifier: "merchantPayoutOutput",
        transactionIndex: 0,
        lockingBytecode: contract.merchantLockingBytecode,
        valueSatoshis: built.merchantPaidSatoshis,
        roleIdentifier: "settler",
      },
    ],
    memo: billTitle ? `${billTitle} - settleBill` : "CakeSplit settleBill",
    transactionHash: txid,
    broadcasted: true,
  });

  return {
    kind: "settled",
    txid,
    explorerUrl: getExplorerTxUrl(txid, contract.network),
    merchantPaidSatoshis: built.merchantPaidSatoshis,
    feeSatoshis: built.feeSatoshis,
    sweptUtxoCount: built.sweptUtxoCount,
    invitationJson: invitation.serializedJson,
    broadcastedAt: Date.now(),
  };
}

/**
 * Builds, pre-flight verifies against the BCH 2026 VM, broadcasts an organizer-signed
 * `cancelBill` refund transaction, and produces a Schnorr-signed broadcasted XO Invitation.
 */
export async function executeCancelBillAction(params: {
  contract: CompiledCakeSplitContract;
  utxos: OnChainUtxo[];
  organizerPrivateKeyHex: string;
  refundAddress: string;
  billTitle?: string;
}): Promise<CancelBillBroadcastResult> {
  const { contract, utxos, organizerPrivateKeyHex, refundAddress, billTitle } =
    params;

  const trimmedRefundAddress = refundAddress.trim();
  if (!isValidCashAddress(trimmedRefundAddress, contract.network)) {
    throw new Error(
      `Enter a valid ${contract.network === "mainnet" ? "Mainnet" : "Chipnet"} refund CashAddress.`,
    );
  }

  const organizerPrivateKey = hexToBin(organizerPrivateKeyHex.trim());
  const built = buildCancelBillTransaction({
    contract,
    potUtxos: utxos,
    organizerPrivateKey,
    refundAddress: trimmedRefundAddress,
  });

  const vmCheck = verifyTransactionWithBchVm(
    built.transaction,
    built.sourceOutputs,
  );
  if (!vmCheck.ok) {
    throw new Error(
      `Pre-flight BCH VM rejected cancellation transaction: ${vmCheck.error}`,
    );
  }

  const txid = await broadcastRawTransaction(built.rawTxHex, contract.network);
  const totalPotSatoshis = utxos.reduce((sum, u) => sum + u.satoshis, 0n);
  const refundLockingHex = cashAddressToLockingHex(trimmedRefundAddress);
  const invitation = createSignedCakeSplitInvitation({
    contract,
    actionIdentifier: "cancelBill",
    privateKeyHex: organizerPrivateKeyHex,
    currentPotSatoshis: totalPotSatoshis,
    refundLockingHex,
    outputs: [
      {
        outputIdentifier: "refundOutput",
        transactionIndex: 0,
        lockingBytecode: hexToBin(refundLockingHex),
        valueSatoshis: built.refundedSatoshis,
        roleIdentifier: "organizer",
      },
    ],
    memo: billTitle ? `${billTitle} - cancelBill` : "CakeSplit cancelBill",
    transactionHash: txid,
    broadcasted: true,
  });

  return {
    kind: "cancelled",
    txid,
    explorerUrl: getExplorerTxUrl(txid, contract.network),
    refundAddress: trimmedRefundAddress,
    refundedSatoshis: built.refundedSatoshis,
    feeSatoshis: built.feeSatoshis,
    invitationJson: invitation.serializedJson,
    broadcastedAt: Date.now(),
  };
}
