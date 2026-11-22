import { hexToBin } from "@bitauth/libauth";
import {
  getExplorerTxUrl,
  lockingHexToCashAddress,
  type CompiledCakeSplitContract,
  type ContractPotState,
} from "@/lib/bch";
import { createSignedCakeSplitInvitation } from "@/lib/xo";
import type {
  BroadcastReceipt,
  ReceiptHistoryEntry,
} from "@/services/client/billNetworkService";

/**
 * Reconstructs a full receipt + broadcasted XO Invitation JSON straight from BCH
 * on-chain history when a user revisits an already-settled or refunded bill link.
 */
export function buildReceiptFromOnChainResolution(
  contract: CompiledCakeSplitContract,
  potState: ContractPotState,
  billTitle?: string,
): BroadcastReceipt | null {
  const resolution = potState.resolution;
  if (!resolution) return null;

  const historyEntries: ReceiptHistoryEntry[] = potState.history.map((entry) => ({
    txid: entry.txid,
    explorerUrl: getExplorerTxUrl(entry.txid, contract.network),
    role:
      entry.txid === resolution.txid
        ? resolution.kind === "settled"
          ? "settlement"
          : "refund"
        : "deposit",
    isUnconfirmed: entry.isUnconfirmed,
  }));

  if (resolution.kind === "settled") {
    const invitation = createSignedCakeSplitInvitation({
      contract,
      actionIdentifier: "settleBill",
      currentPotSatoshis: resolution.outputSatoshis + resolution.feeSatoshis,
      outputs: [
        {
          outputIdentifier: "merchantPayoutOutput",
          transactionIndex: 0,
          lockingBytecode: contract.merchantLockingBytecode,
          valueSatoshis: resolution.outputSatoshis,
          roleIdentifier: "settler",
        },
      ],
      memo: billTitle ? `${billTitle} - settleBill` : "CakeSplit settleBill",
      transactionHash: resolution.txid,
      broadcasted: true,
    });

    return {
      kind: "settled",
      txid: resolution.txid,
      explorerUrl: getExplorerTxUrl(resolution.txid, contract.network),
      merchantPaidSatoshis: resolution.outputSatoshis,
      feeSatoshis: resolution.feeSatoshis,
      sweptUtxoCount: resolution.inputCount,
      invitationJson: invitation.serializedJson,
      broadcastedAt: potState.fetchedAt,
      historyEntries,
    };
  }

  let refundAddress = contract.merchantAddress;
  try {
    refundAddress = lockingHexToCashAddress(
      resolution.destinationLockingHex,
      contract.network,
      false,
    );
  } catch {
    // Fallback if refunded to a non-standard script.
  }

  const invitation = createSignedCakeSplitInvitation({
    contract,
    actionIdentifier: "cancelBill",
    currentPotSatoshis: resolution.outputSatoshis + resolution.feeSatoshis,
    refundLockingHex: resolution.destinationLockingHex,
    outputs: [
      {
        outputIdentifier: "refundOutput",
        transactionIndex: 0,
        lockingBytecode: hexToBin(resolution.destinationLockingHex),
        valueSatoshis: resolution.outputSatoshis,
        roleIdentifier: "organizer",
      },
    ],
    memo: billTitle ? `${billTitle} - cancelBill` : "CakeSplit cancelBill",
    transactionHash: resolution.txid,
    broadcasted: true,
  });

  return {
    kind: "cancelled",
    txid: resolution.txid,
    explorerUrl: getExplorerTxUrl(resolution.txid, contract.network),
    refundAddress,
    refundedSatoshis: resolution.outputSatoshis,
    feeSatoshis: resolution.feeSatoshis,
    invitationJson: invitation.serializedJson,
    broadcastedAt: potState.fetchedAt,
    historyEntries,
  };
}
