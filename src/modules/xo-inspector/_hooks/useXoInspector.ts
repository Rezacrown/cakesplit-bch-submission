"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { loadOrCreateOrganizerKey } from "@/lib/bch";
import type { CakeSplitActionId } from "@/lib/xo";
import {
  buildXoInspectorSnapshot,
  type XoInspectorSnapshot,
} from "../_utils/xoInspectorHelpers";

const DEFAULT_NETWORK = "mainnet" as const;

const subscribeClient = () => () => {};

function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeClient,
    () => true,
    () => false,
  );
}

function downloadJsonFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function useXoInspector() {
  const isClient = useIsClient();
  const searchParams = useSearchParams();
  const billToken = searchParams.get("d")?.trim() || null;

  const [activeAction, setActiveAction] =
    useState<CakeSplitActionId>("openBill");

  const snapshot: XoInspectorSnapshot | null = useMemo(() => {
    if (!isClient) return null;
    const organizerKey = loadOrCreateOrganizerKey(DEFAULT_NETWORK);
    return buildXoInspectorSnapshot({
      billToken,
      network: DEFAULT_NETWORK,
      organizerKey,
    });
  }, [isClient, billToken]);

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(label);
    } catch {
      toast.error("Clipboard unavailable — please copy manually.");
    }
  };

  const handleCopyTemplateId = () => {
    if (!snapshot) return;
    void copyText(snapshot.templateId, "Copied XO Template ID to clipboard");
  };

  const handleCopyTemplateJson = () => {
    if (!snapshot) return;
    void copyText(
      snapshot.rawTemplateJson,
      "Copied CakeSplit XO Template Extended JSON",
    );
  };

  const handleDownloadTemplateJson = () => {
    if (!snapshot) return;
    downloadJsonFile("cakesplit-template.json", snapshot.rawTemplateJson);
    toast.success("Downloaded cakesplit-template.json");
  };

  const handleCopyContractAddress = () => {
    if (!snapshot) return;
    void copyText(
      snapshot.context.contract.contractAddress,
      "Copied P2SH32 contract CashAddress",
    );
  };

  const activeInvitation = snapshot
    ? snapshot.invitations[activeAction]
    : null;

  const handleCopyEntityId = () => {
    if (!activeInvitation) return;
    void copyText(
      activeInvitation.entityIdentifier,
      "Copied XO Entity Identifier",
    );
  };

  const handleCopyInvitationJson = () => {
    if (!activeInvitation) return;
    void copyText(
      activeInvitation.rawJson,
      `Copied signed ${activeInvitation.actionId} XO Invitation JSON`,
    );
  };

  const handleDownloadInvitationJson = () => {
    if (!activeInvitation) return;
    downloadJsonFile(
      `cakesplit-${activeInvitation.actionId}-invitation.json`,
      activeInvitation.rawJson,
    );
    toast.success(
      `Downloaded cakesplit-${activeInvitation.actionId}-invitation.json`,
    );
  };

  return {
    snapshot,
    activeAction,
    activeInvitation,
    onSelectAction: setActiveAction,
    onCopyTemplateId: handleCopyTemplateId,
    onCopyTemplateJson: handleCopyTemplateJson,
    onDownloadTemplateJson: handleDownloadTemplateJson,
    onCopyContractAddress: handleCopyContractAddress,
    onCopyEntityId: handleCopyEntityId,
    onCopyInvitationJson: handleCopyInvitationJson,
    onDownloadInvitationJson: handleDownloadInvitationJson,
  };
}
