"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useBchPrice } from "@/hooks/useBchPrice";
import {
  encodeShareableBill,
  generateRandomBillNonceHex,
  loadOrCreateOrganizerKey,
} from "@/lib/bch";
import { useAppStore, type SplitParticipantDraft } from "@/store/app-store";
import {
  MAX_PARTICIPANTS,
  MIN_PARTICIPANTS,
  type InputCurrencyUnit,
  type SplitMode,
} from "../constants";
import {
  applyEqualSplitToParticipants,
  buildCustomInputMap,
  computeBillSummary,
  parseUnitInputToSatoshis,
  satoshisToUnitInput,
} from "../_utils/billFormMath";
import {
  buildShareablePayloadFromSnapshot,
  isMerchantAddressValidForNetwork,
  validateBillDraft,
  type CreateBillFieldErrors,
} from "../_utils/billFormValidation";

const USD_INPUT_PATTERN = /^\d*(\.\d{0,4})?$/;
const BCH_INPUT_PATTERN = /^\d*(\.\d{0,8})?$/;

export function useCreateBillForm() {
  const router = useRouter();
  const network = "mainnet" as const;
  const title = useAppStore((s) => s.title);
  const merchantAddress = useAppStore((s) => s.merchantAddress);
  const participants = useAppStore((s) => s.participants);
  const setTitle = useAppStore((s) => s.setTitle);
  const setMerchantAddress = useAppStore((s) => s.setMerchantAddress);
  const setParticipants = useAppStore((s) => s.setParticipants);

  const { priceUsd, isLive: isPriceLive, source: priceSource } = useBchPrice();

  const [inputUnit, setInputUnit] = useState<InputCurrencyUnit>("usd");
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [totalBillInput, setTotalBillInput] = useState(() =>
    satoshisToUnitInput(computeBillSummary(participants).billTotalSats, "usd", priceUsd),
  );
  const [customInputs, setCustomInputs] = useState<Record<string, string>>(() =>
    buildCustomInputMap(participants, "usd", priceUsd),
  );
  const [fieldErrors, setFieldErrors] = useState<CreateBillFieldErrors>({});
  const [isOpening, setIsOpening] = useState(false);

  const lastPriceRef = useRef(priceUsd);

  useEffect(() => {
    if (lastPriceRef.current === priceUsd) return;
    lastPriceRef.current = priceUsd;
    if (inputUnit !== "usd") return;
    const currentParticipants = useAppStore.getState().participants;
    if (splitMode === "equal") {
      if (!totalBillInput) return;
      setParticipants(
        applyEqualSplitToParticipants(currentParticipants, totalBillInput, "usd", priceUsd),
      );
      return;
    }
    if (!Object.values(customInputs).some((v) => v.trim().length > 0)) return;
    setParticipants(
      currentParticipants.map((p) => ({
        ...p,
        shareSatoshis: parseUnitInputToSatoshis(customInputs[p.id] ?? "", "usd", priceUsd),
      })),
    );
  }, [priceUsd, inputUnit, splitMode, totalBillInput, customInputs, setParticipants]);

  const summary = useMemo(() => computeBillSummary(participants), [participants]);
  const isAddressValid = useMemo(
    () => isMerchantAddressValidForNetwork(merchantAddress, network),
    [merchantAddress],
  );
  const clearErrors = () => {
    if (Object.keys(fieldErrors).length > 0) setFieldErrors({});
  };

  const handleInputUnitChange = (nextUnit: InputCurrencyUnit) => {
    if (nextUnit === inputUnit) return;
    const totalSats = computeBillSummary(participants).billTotalSats;
    setInputUnit(nextUnit);
    if (splitMode === "equal") {
      setTotalBillInput(satoshisToUnitInput(totalSats, nextUnit, priceUsd));
    } else {
      setCustomInputs(buildCustomInputMap(participants, nextUnit, priceUsd));
    }
    clearErrors();
  };

  const handleTotalBillChange = (value: string) => {
    const normalized = value.replace(/,/g, "");
    const pattern = inputUnit === "usd" ? USD_INPUT_PATTERN : BCH_INPUT_PATTERN;
    if (!pattern.test(normalized)) return;
    setTotalBillInput(normalized);
    setParticipants(applyEqualSplitToParticipants(participants, normalized, inputUnit, priceUsd));
    if (fieldErrors.amount) clearErrors();
  };

  const handleSplitModeChange = (nextMode: SplitMode) => {
    if (nextMode === splitMode) return;
    setSplitMode(nextMode);
    clearErrors();
    if (nextMode === "equal") {
      const totalSats = computeBillSummary(participants).billTotalSats;
      const nextText = satoshisToUnitInput(totalSats, inputUnit, priceUsd);
      setTotalBillInput(nextText);
      setParticipants(applyEqualSplitToParticipants(participants, nextText, inputUnit, priceUsd));
    } else {
      setCustomInputs(buildCustomInputMap(participants, inputUnit, priceUsd));
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
      setParticipants(applyEqualSplitToParticipants(appended, totalBillInput, inputUnit, priceUsd));
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
      setParticipants(applyEqualSplitToParticipants(filtered, totalBillInput, inputUnit, priceUsd));
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

  const handleParticipantAmountChange = (id: string, raw: string) => {
    const normalized = raw.replace(/,/g, "");
    const pattern = inputUnit === "usd" ? USD_INPUT_PATTERN : BCH_INPUT_PATTERN;
    if (!pattern.test(normalized)) return;
    setCustomInputs((prev) => ({ ...prev, [id]: normalized }));
    const sats = parseUnitInputToSatoshis(normalized, inputUnit, priceUsd);
    setParticipants(participants.map((p) => (p.id === id ? { ...p, shareSatoshis: sats } : p)));
    if (fieldErrors.amount || fieldErrors.participants?.[id]) clearErrors();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateBillDraft({ network, title, merchantAddress, splitMode, participants });
    if (!result.ok) {
      setFieldErrors(result.fieldErrors);
      toast.error(result.firstMessage);
      return;
    }
    try {
      setIsOpening(true);
      setFieldErrors({});
      const organizerKey = loadOrCreateOrganizerKey(network);
      const payload = buildShareablePayloadFromSnapshot({
        snapshot: result.snapshot,
        organizerPublicKeyHex: organizerKey.publicKeyHex,
        billNonceHex: generateRandomBillNonceHex(8),
        createdAt: Date.now(),
      });
      toast.success(`${result.snapshot.title} is ready - opening your table check.`);
      router.push(`/bill?d=${encodeShareableBill(payload)}`);
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
    title,
    merchantAddress,
    participants,
    splitMode,
    inputUnit,
    priceUsd,
    isPriceLive,
    priceSource,
    totalBillInput,
    customInputs,
    summary,
    isAddressValid,
    fieldErrors,
    isOpening,
    canAddParticipant: participants.length < MAX_PARTICIPANTS,
    canRemoveParticipant: participants.length > MIN_PARTICIPANTS,
    onTitleChange: (value: string) => {
      setTitle(value);
      if (fieldErrors.title) clearErrors();
    },
    onMerchantAddressChange: (value: string) => {
      setMerchantAddress(value);
      if (fieldErrors.merchantAddress) clearErrors();
    },
    onTotalBillChange: handleTotalBillChange,
    onSplitModeChange: handleSplitModeChange,
    onInputUnitChange: handleInputUnitChange,
    onAddParticipant: handleAddParticipant,
    onRemoveParticipant: handleRemoveParticipant,
    onParticipantLabelChange: (id: string, label: string) => {
      setParticipants(participants.map((p) => (p.id === id ? { ...p, label } : p)));
      if (fieldErrors.participants?.[id]) clearErrors();
    },
    onParticipantAmountChange: handleParticipantAmountChange,
    onSubmit: handleSubmit,
  };
}
