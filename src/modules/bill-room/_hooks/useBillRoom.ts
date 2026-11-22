"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useBchPrice } from "@/hooks/useBchPrice";
import {
  buildShareableBillUrl,
  computePayableSlices,
  generatePaymentQrDataUrl,
  generateUrlQrDataUrl,
  type PayableParticipantSlice,
} from "@/lib/bch";
import { getShareableAppOrigin } from "@/lib/config/env";
import {
  extractBillToken,
  parseAndCompileBillToken,
} from "../_utils/billRoomHelpers";
import { useBillPotNetwork } from "./useBillPotNetwork";

export type BillParticipant = PayableParticipantSlice;

export interface ActivePaymentQr {
  participant: BillParticipant;
  uri: string;
  dataUrl: string;
}

export function useBillRoom() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawToken = searchParams.get("d")?.trim() ?? "";

  const [pasteInput, setPasteInput] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [shareQrOpen, setShareQrOpen] = useState(false);
  const [shareQrDataUrl, setShareQrDataUrl] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const [selectedParticipant, setSelectedParticipant] =
    useState<BillParticipant | null>(null);
  const [paymentQr, setPaymentQr] = useState<ActivePaymentQr | null>(null);
  const [isGeneratingPaymentQr, setIsGeneratingPaymentQr] = useState(false);
  const qrRequestIdRef = useRef(0);

  const parsedResult = useMemo(() => {
    if (!rawToken) return null;
    return parseAndCompileBillToken(rawToken);
  }, [rawToken]);

  const activeBill = parsedResult?.ok ? parsedResult.data : null;
  const invalidTokenError =
    parsedResult && !parsedResult.ok ? parsedResult.error : null;

  const payableParticipants = useMemo<BillParticipant[]>(() => {
    if (!activeBill) return [];
    return computePayableSlices(
      activeBill.bill.participants,
      activeBill.bill.settlementFeeSatoshis,
    );
  }, [activeBill]);

  const { priceUsd, isLive: isPriceLive } = useBchPrice();
  const potNetwork = useBillPotNetwork(activeBill);

  const getShareUrl = (): string => {
    if (!activeBill) return "";
    return buildShareableBillUrl(activeBill.bill, getShareableAppOrigin());
  };

  const copyText = async (text: string, successLabel: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successLabel);
    } catch {
      toast.error("Clipboard unavailable - please copy manually.");
    }
  };

  const handleOpenSubmittedBill = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const extracted = extractBillToken(pasteInput);
    if (!extracted) {
      setPasteError("Paste a full CakeSplit bill link or valid bill token.");
      return;
    }

    const check = parseAndCompileBillToken(extracted);
    if (!check.ok) {
      setPasteError(check.error);
      return;
    }

    setPasteError(null);
    setPasteInput("");
    router.push(`/bill?d=${extracted}`);
  };

  const handleOpenShareQr = () => {
    if (!activeBill) return;
    setShareQrOpen(true);
    setShareQrDataUrl(null);
    const shareUrl = getShareUrl();
    void generateUrlQrDataUrl(shareUrl, { width: 360, margin: 3 })
      .then((url) => setShareQrDataUrl(url))
      .catch(() => toast.error("Could not generate share QR code."));
  };

  const handleSelectParticipant = (participant: BillParticipant) => {
    if (!activeBill) return;
    const requestId = qrRequestIdRef.current + 1;
    qrRequestIdRef.current = requestId;

    setSelectedParticipant(participant);
    setPaymentQr(null);
    setIsGeneratingPaymentQr(true);

    void generatePaymentQrDataUrl({
      address: activeBill.contract.contractAddress,
      satoshis: participant.payableSatoshis,
      label: participant.label,
      message: activeBill.bill.title,
      options: { width: 320, margin: 3 },
    })
      .then(({ uri, dataUrl }) => {
        if (qrRequestIdRef.current === requestId) {
          setPaymentQr({ participant, uri, dataUrl });
        }
      })
      .catch(() => {
        if (qrRequestIdRef.current === requestId) {
          toast.error("Could not generate Bitcoin Cash payment QR.");
        }
      })
      .finally(() => {
        if (qrRequestIdRef.current === requestId) {
          setIsGeneratingPaymentQr(false);
        }
      });
  };

  const handleClosePaymentQr = () => {
    qrRequestIdRef.current += 1;
    setSelectedParticipant(null);
    setPaymentQr(null);
    setIsGeneratingPaymentQr(false);
  };

  const handleConfirmCancelBill = async (refundAddress: string) => {
    try {
      await potNetwork.onCancelBill(refundAddress);
      setCancelDialogOpen(false);
    } catch {
      // Toast and error state are handled by the cancel mutation.
    }
  };

  return {
    activeBill,
    payableParticipants,
    invalidTokenError,
    priceUsd,
    isPriceLive,
    ...potNetwork,
    pasteInput,
    pasteError,
    shareQrOpen,
    shareQrDataUrl,
    cancelDialogOpen,
    selectedParticipant,
    paymentQr,
    isGeneratingPaymentQr,
    onPasteInputChange: (value: string) => {
      setPasteInput(value);
      if (pasteError) setPasteError(null);
    },
    onOpenSubmittedBill: handleOpenSubmittedBill,
    onCopyBillLink: () => {
      const url = getShareUrl();
      if (url) void copyText(url, "Copied table check link to clipboard");
    },
    onOpenShareQr: handleOpenShareQr,
    onCloseShareQr: () => setShareQrOpen(false),
    onCopyPotAddress: () => {
      if (!activeBill) return;
      void copyText(
        activeBill.contract.contractAddress,
        "Copied shared pot CashAddress to clipboard",
      );
    },
    onCopyCashierAddress: () => {
      if (!activeBill) return;
      void copyText(
        activeBill.bill.merchantAddress,
        "Copied cashier CashAddress to clipboard",
      );
    },
    onSelectParticipant: handleSelectParticipant,
    onClosePaymentQr: handleClosePaymentQr,
    onCopyPaymentUri: () => {
      if (!paymentQr) return;
      void copyText(paymentQr.uri, "Copied BIP21 payment URI to clipboard");
    },
    onOpenCancelDialog: () => setCancelDialogOpen(true),
    onCloseCancelDialog: () => setCancelDialogOpen(false),
    onConfirmCancelBill: handleConfirmCancelBill,
    onCopyBroadcastInvitationJson: () => {
      const json = potNetwork.broadcastReceipt?.invitationJson;
      if (!json) return;
      void copyText(json, "Copied broadcasted XO Invitation JSON to clipboard");
    },
  };
}
