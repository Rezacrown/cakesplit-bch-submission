import type { FormEvent } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Receipt } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SplitParticipantDraft } from "@/store/app-store";
import type { InputCurrencyUnit, SplitMode } from "../constants";
import type { BillSummaryMetrics } from "../_utils/billFormMath";
import type { CreateBillFieldErrors } from "../_utils/billFormValidation";
import { AmountUnitSection } from "./AmountUnitSection";
import { ParticipantRows } from "./ParticipantRows";
import { ReceiptTotalsSection } from "./ReceiptTotalsSection";

interface SplitBillReceiptCardProps {
  title: string;
  merchantAddress: string;
  participants: SplitParticipantDraft[];
  splitMode: SplitMode;
  inputUnit: InputCurrencyUnit;
  priceUsd: number;
  isPriceLive: boolean;
  totalBillInput: string;
  customInputs: Record<string, string>;
  summary: BillSummaryMetrics;
  isAddressValid: boolean;
  fieldErrors: CreateBillFieldErrors;
  isOpening: boolean;
  canAddParticipant: boolean;
  canRemoveParticipant: boolean;
  onTitleChange: (value: string) => void;
  onMerchantAddressChange: (value: string) => void;
  onTotalBillChange: (value: string) => void;
  onSplitModeChange: (mode: SplitMode) => void;
  onInputUnitChange: (unit: InputCurrencyUnit) => void;
  onAddParticipant: () => void;
  onRemoveParticipant: (id: string) => void;
  onParticipantLabelChange: (id: string, label: string) => void;
  onParticipantAmountChange: (id: string, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function SplitBillReceiptCard(props: SplitBillReceiptCardProps) {
  const {
    title,
    merchantAddress,
    participants,
    splitMode,
    inputUnit,
    priceUsd,
    isPriceLive,
    totalBillInput,
    customInputs,
    summary,
    isAddressValid,
    fieldErrors,
    isOpening,
    canAddParticipant,
    canRemoveParticipant,
    onTitleChange,
    onMerchantAddressChange,
    onTotalBillChange,
    onSplitModeChange,
    onInputUnitChange,
    onAddParticipant,
    onRemoveParticipant,
    onParticipantLabelChange,
    onParticipantAmountChange,
    onSubmit,
  } = props;

  return (
    <div className="ink-card overflow-hidden rounded-3xl">
      <div className="paper-stipple flex flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-[#18181B]/15 bg-[#F4F4F5] px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-2">
          <Receipt className="size-4 text-[#111111]" aria-hidden="true" />
          <span className="font-mono text-xs font-bold tracking-widest text-[#111111] uppercase">
            Table Receipt
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#18181B]/25 bg-[#FFFFFF] px-3 py-0.5 font-mono text-[11px] font-bold text-[#111111]">
          <span
            className="size-1.5 rounded-full bg-[#18181B]"
            aria-hidden="true"
          />
          Bitcoin Cash Mainnet
        </span>
      </div>

      <div className="p-5 sm:p-7">
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="space-y-1.5">
            <Label
              htmlFor="bill-title"
              className="font-mono text-[11px] font-bold tracking-wider text-[#18181B] uppercase"
            >
              Table / Bill Title
            </Label>
            <Input
              id="bill-title"
              placeholder="Dinner at Ramen House"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              aria-invalid={Boolean(fieldErrors.title)}
              className="h-11 rounded-xl border-[1.5px] border-[#18181B]/20 bg-[#FAF9F6] px-3.5 text-sm font-medium text-[#111111] placeholder:text-[#71717A]/70 focus-visible:border-[#18181B] focus-visible:bg-[#FFFFFF]"
            />
            {fieldErrors.title ? (
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#18181B]">
                <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                <span>{fieldErrors.title}</span>
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label
                htmlFor="merchant-address"
                className="font-mono text-[11px] font-bold tracking-wider text-[#18181B] uppercase"
              >
                Cashier Bitcoin Cash Address
              </Label>
              {isAddressValid ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#18181B]/20 bg-[#F4F4F5] px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#111111]">
                  <CheckCircle2 className="size-3" aria-hidden="true" />
                  Valid Mainnet
                </span>
              ) : null}
            </div>
            <Input
              id="merchant-address"
              placeholder="bitcoincash:q..."
              value={merchantAddress}
              onChange={(e) => onMerchantAddressChange(e.target.value)}
              aria-invalid={Boolean(fieldErrors.merchantAddress)}
              className="h-11 rounded-xl border-[1.5px] border-[#18181B]/20 bg-[#FAF9F6] px-3.5 font-mono text-xs font-medium text-[#111111] placeholder:text-[#71717A]/70 focus-visible:border-[#18181B] focus-visible:bg-[#FFFFFF]"
            />
            {fieldErrors.merchantAddress ? (
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#18181B]">
                <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                <span>{fieldErrors.merchantAddress}</span>
              </p>
            ) : null}
          </div>

          <AmountUnitSection
            splitMode={splitMode}
            inputUnit={inputUnit}
            priceUsd={priceUsd}
            totalBillInput={totalBillInput}
            billTotalSats={summary.billTotalSats}
            hasAmountError={Boolean(fieldErrors.amount)}
            onSplitModeChange={onSplitModeChange}
            onInputUnitChange={onInputUnitChange}
            onTotalBillChange={onTotalBillChange}
          />

          <ParticipantRows
            participants={participants}
            splitMode={splitMode}
            inputUnit={inputUnit}
            priceUsd={priceUsd}
            customInputs={customInputs}
            participantErrors={fieldErrors.participants}
            canAdd={canAddParticipant}
            canRemove={canRemoveParticipant}
            onAdd={onAddParticipant}
            onRemove={onRemoveParticipant}
            onLabelChange={onParticipantLabelChange}
            onAmountChange={onParticipantAmountChange}
          />

          <ReceiptTotalsSection
            summary={summary}
            priceUsd={priceUsd}
            isPriceLive={isPriceLive}
          />

          <button
            type="submit"
            disabled={isOpening}
            className="ink-pill-primary inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-4 font-display text-base font-bold disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>
              {isOpening ? "Opening Table Check..." : "Create Table Check"}
            </span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
