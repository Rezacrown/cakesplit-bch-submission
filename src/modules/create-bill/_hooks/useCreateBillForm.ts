"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  encodeShareableBill,
  generateRandomBillNonceHex,
  loadOrCreateOrganizerKey,
} from "@/lib/bch";
import { useAppStore, type SplitParticipantDraft } from "@/store/app-store";
import {
  MAX_PARTICIPANTS,
  MIN_PARTICIPANTS,
  type SplitMode,
} from "../constants";
import {
  buildShareablePayloadFromSnapshot,
  computeBillSummary,
  computeEqualSplitSats,
  formatSatsAsBch,
  isMerchantAddressValidForNetwork,
  parseBchInputToSats,
  validateBillDraft,
  type CreateBillFieldErrors,
} from "../_utils/billFormMath";

const DECIMAL_INPUT_PATTERN = /^\d*(\.\d{0,8})?$/;

function buildCustomInputMap(
  participants: SplitParticipantDraft[],
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const person of participants) {
    map[person.id] =
      person.shareSatoshis > 0 ? formatSatsAsBch(person.shareSatoshis) : "";
  }
  return map;
}

export function useCreateBillForm() {
  const router = useRouter();
  const network = useAppStore((s) => s.network);
  const title = useAppStore((s) => s.title);
  const merchantAddress = useAppStore((s) => s.merchantAddress);
  const participants = useAppStore((s) => s.participants);
  const setTitle = useAppStore((s) => s.setTitle);
  const setMerchantAddress = useAppStore((s) => s.setMerchantAddress);
  const setParticipants = useAppStore((s) => s.setParticipants);

  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [totalBillInput, setTotalBillInput] = useState(() => {
    const initialTotal = computeBillSummary(participants).billTotalSats;
    return initialTotal > 0 ? formatSatsAsBch(initialTotal) : "";
  });
  const [customInputs, setCustomInputs] = useState<Record<string, string>>(() =>
    buildCustomInputMap(participants),
  );
  const [fieldErrors, setFieldErrors] = useState<CreateBillFieldErrors>({});
  const [isOpening, setIsOpening] = useState(false);

  const summary = useMemo(
    () => computeBillSummary(participants),
    [participants],
  );

  const isAddressValid = useMemo(
    () => isMerchantAddressValidForNetwork(merchantAddress, network),
    [merchantAddress, network],
  );

  const clearErrors = () => {
    if (Object.keys(fieldErrors).length > 0) {
      setFieldErrors({});
    }
  };

  const applyEqualShares = (
    nextList: SplitParticipantDraft[],
    rawTotal: string,
  ) => {
    const totalSats = parseBchInputToSats(rawTotal);
    const slices = computeEqualSplitSats(totalSats, nextList.length);
    return nextList.map((person, idx) => ({
      ...person,
      shareSatoshis: slices[idx] ?? 0,
    }));
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (fieldErrors.title) clearErrors();
  };

  const handleMerchantAddressChange = (value: string) => {
    setMerchantAddress(value);
    if (fieldErrors.merchantAddress) clearErrors();
  };

  const handleTotalBillChange = (value: string) => {
    const normalized = value.replace(/,/g, "");
    if (!DECIMAL_INPUT_PATTERN.test(normalized)) return;
    setTotalBillInput(normalized);
    setParticipants(applyEqualShares(participants, normalized));
    if (fieldErrors.amount) clearErrors();
  };

  const handleSplitModeChange = (nextMode: SplitMode) => {
    if (nextMode === splitMode) return;
    setSplitMode(nextMode);
    clearErrors();

    if (nextMode === "equal") {
      const currentTotalSats = computeBillSummary(participants).billTotalSats;
      const nextTotalText =
        currentTotalSats > 0 ? formatSatsAsBch(currentTotalSats) : "";
      setTotalBillInput(nextTotalText);
      setParticipants(applyEqualShares(participants, nextTotalText));
    } else {
      setCustomInputs(buildCustomInputMap(participants));
    }
  };

  const handleAddParticipant = () => {
    if (participants.length >= MAX_PARTICIPANTS) return;
    const nextIndex = participants.length + 1;
    const newId = `p-${Date.now()}-${nextIndex}`;
    const appended: SplitParticipantDraft[] = [
      ...participants,
      { id: newId, label: `Friend ${nextIndex}`, shareSatoshis: 0 },
    ];

    if (splitMode === "equal") {
      setParticipants(applyEqualShares(appended, totalBillInput));
    } else {
      setParticipants(appended);
      setCustomInputs((prev) => ({ ...prev, [newId]: "" }));
    }
    clearErrors();
  };

  const handleRemoveParticipant = (id: string) => {
    if (participants.length <= MIN_PARTICIPANTS) return;
    const filtered = participants.filter((p) => p.id !== id);

    if (splitMode === "equal") {
      setParticipants(applyEqualShares(filtered, totalBillInput));
    } else {
      setParticipants(filtered);
      setCustomInputs((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
    clearErrors();
  };

  const handleParticipantLabelChange = (id: string, label: string) => {
    setParticipants(
      participants.map((p) => (p.id === id ? { ...p, label } : p)),
    );
    if (fieldErrors.participants?.[id]) clearErrors();
  };

  const handleParticipantAmountChange = (id: string, raw: string) => {
    const normalized = raw.replace(/,/g, "");
    if (!DECIMAL_INPUT_PATTERN.test(normalized)) return;
    setCustomInputs((prev) => ({ ...prev, [id]: normalized }));
    const sats = parseBchInputToSats(normalized);
    setParticipants(
      participants.map((p) =>
        p.id === id ? { ...p, shareSatoshis: sats } : p,
      ),
    );
    if (fieldErrors.amount || fieldErrors.participants?.[id]) {
      clearErrors();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateBillDraft({
      network,
      title,
      merchantAddress,
      splitMode,
      participants,
    });

    if (!result.ok) {
      setFieldErrors(result.fieldErrors);
      toast.error(result.firstMessage);
      return;
    }

    try {
      setIsOpening(true);
      setFieldErrors({});
      const organizerKey = loadOrCreateOrganizerKey(result.snapshot.network);
      const billNonceHex = generateRandomBillNonceHex(8);
      const payload = buildShareablePayloadFromSnapshot({
        snapshot: result.snapshot,
        organizerPublicKeyHex: organizerKey.publicKeyHex,
        billNonceHex,
        createdAt: Date.now(),
      });
      const token = encodeShareableBill(payload);

      toast.success(
        `${result.snapshot.title} is ready — opening your table check.`,
      );
      router.push(`/bill?d=${token}`);
    } catch (error) {
      setIsOpening(false);
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not create the table check. Please check your inputs.",
      );
    }
  };

  return {
    network,
    title,
    merchantAddress,
    participants,
    splitMode,
    totalBillInput,
    customInputs,
    summary,
    isAddressValid,
    fieldErrors,
    isOpening,
    canAddParticipant: participants.length < MAX_PARTICIPANTS,
    canRemoveParticipant: participants.length > MIN_PARTICIPANTS,
    onTitleChange: handleTitleChange,
    onMerchantAddressChange: handleMerchantAddressChange,
    onTotalBillChange: handleTotalBillChange,
    onSplitModeChange: handleSplitModeChange,
    onAddParticipant: handleAddParticipant,
    onRemoveParticipant: handleRemoveParticipant,
    onParticipantLabelChange: handleParticipantLabelChange,
    onParticipantAmountChange: handleParticipantAmountChange,
    onSubmit: handleSubmit,
  };
}
