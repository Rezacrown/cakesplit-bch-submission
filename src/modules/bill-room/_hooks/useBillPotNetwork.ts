"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  computePotProgress,
  loadOrCreateOrganizerKey,
  type ContractPotState,
  type PotProgress,
} from "@/lib/bch";
import {
  executeCancelBillAction,
  executeSettleBillAction,
  fetchLiveBillPot,
  type BroadcastReceipt,
} from "@/services/client/billNetworkService";
import type { CompiledBillRoomState } from "../_utils/billRoomHelpers";

const subscribeClient = () => () => {};

function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeClient,
    () => true,
    () => false,
  );
}

export function useBillPotNetwork(activeBill: CompiledBillRoomState | null) {
  const isClient = useIsClient();
  const [receiptByToken, setReceiptByToken] = useState<
    Record<string, BroadcastReceipt>
  >({});

  const token = activeBill?.token ?? "";
  const contract = activeBill?.contract ?? null;
  const bill = activeBill?.bill ?? null;
  const broadcastReceipt = token ? (receiptByToken[token] ?? null) : null;

  const organizerKey = useMemo(() => {
    if (!isClient || !bill) return null;
    try {
      return loadOrCreateOrganizerKey(bill.network);
    } catch {
      return null;
    }
  }, [isClient, bill]);

  const isOrganizer = Boolean(
    organizerKey &&
      bill &&
      organizerKey.publicKeyHex.toLowerCase() ===
        bill.organizerPublicKeyHex.toLowerCase(),
  );

  const potQuery = useQuery<ContractPotState, Error>({
    queryKey: ["bill-pot", contract?.scriptHash, contract?.network],
    queryFn: () => {
      if (!contract) {
        throw new Error("No compiled CakeSplit contract available.");
      }
      return fetchLiveBillPot(contract);
    },
    enabled: Boolean(contract),
    refetchInterval: broadcastReceipt ? false : 4_000,
    retry: 1,
  });

  const potState = potQuery.data ?? null;
  const potProgress: PotProgress = useMemo(() => {
    if (potState) return potState.progress;
    if (activeBill) {
      return computePotProgress(0n, activeBill.contract.potGoalSatoshis);
    }
    return computePotProgress(0n, 1n);
  }, [potState, activeBill]);

  const settleMutation = useMutation({
    mutationFn: async () => {
      if (!contract || !bill || !potState) {
        throw new Error("Waiting for live pot UTXOs before settling.");
      }
      return executeSettleBillAction(contract, potState.utxos, bill.title);
    },
    onSuccess: (result) => {
      if (token) {
        setReceiptByToken((prev) => ({ ...prev, [token]: result }));
      }
      toast.success("Paid cashier on Bitcoin Cash Mainnet.");
      void potQuery.refetch();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Settlement broadcast failed.",
      );
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (refundAddress: string) => {
      if (!contract || !bill || !potState) {
        throw new Error("Waiting for live pot UTXOs before cancelling.");
      }
      if (!organizerKey || !isOrganizer) {
        throw new Error(
          "Only the host browser holding the organizer key can cancel this table check.",
        );
      }
      return executeCancelBillAction({
        contract,
        utxos: potState.utxos,
        organizerPrivateKeyHex: organizerKey.privateKeyHex,
        refundAddress,
        billTitle: bill.title,
      });
    },
    onSuccess: (result) => {
      if (token) {
        setReceiptByToken((prev) => ({ ...prev, [token]: result }));
      }
      toast.success("Refund transaction broadcasted on Bitcoin Cash Mainnet.");
      void potQuery.refetch();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Cancellation broadcast failed.",
      );
    },
  });

  const networkError = potQuery.error ? potQuery.error.message : null;
  const actionError =
    settleMutation.error?.message ?? cancelMutation.error?.message ?? null;

  return {
    potState,
    potProgress,
    isInitialPotLoading: potQuery.isLoading,
    isRefreshing: potQuery.isFetching,
    networkError,
    lastSyncedAt: potState?.fetchedAt ?? null,
    isOrganizer,
    broadcastReceipt,
    isSettling: settleMutation.isPending,
    isCancelling: cancelMutation.isPending,
    actionError,
    refreshPot: () => {
      void potQuery.refetch();
    },
    onSettleBill: () => {
      settleMutation.mutate();
    },
    onCancelBill: (refundAddress: string) =>
      cancelMutation.mutateAsync(refundAddress),
  };
}
