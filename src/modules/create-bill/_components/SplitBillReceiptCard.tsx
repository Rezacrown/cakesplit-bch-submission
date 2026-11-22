import type { FormEvent } from "react";
import { ArrowRight, CheckCircle2, Receipt } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BchNetwork } from "@/lib/bch/address";
import type { SplitParticipantDraft } from "@/store/app-store";
import { USD_PER_BCH_REF, type SplitMode } from "../constants";
import {
  formatSatsAsUsdApprox,
  type BillSummaryMetrics,
  type CreateBillFieldErrors,
  type ValidatedBillSnapshot,
} from "../_utils/billFormMath";
import { ParticipantRows } from "./ParticipantRows";
import { ReceiptReadyPanel } from "./ReceiptReadyPanel";
import { ReceiptTotalsSection } from "./ReceiptTotalsSection";

interface SplitBillReceiptCardProps {
  network: BchNetwork;
  title: string;
  merchantAddress: string;
  participants: SplitParticipantDraft[];
  splitMode: SplitMode;
  totalBillInput: string;
  customInputs: Record<string, string>;
  summary: BillSummaryMetrics;
  isAddressValid: boolean;
  fieldErrors: CreateBillFieldErrors;
  readySnapshot: ValidatedBillSnapshot | null;
  canAddParticipant: boolean;
  canRemoveParticipant: boolean;
  onTitleChange: (value: string) => void;
  onMerchantAddressChange: (value: string) => void;
  onTotalBillChange: (value: string) => void;
  onSplitModeChange: (mode: SplitMode) => void;
  onAddParticipant: () => void;
  onRemoveParticipant: (id: string) => void;
  onParticipantLabelChange: (id: string, label: string) => void;
  onParticipantAmountChange: (id: string, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onEditSummary: () => void;
  onReset: () => void;
}

export function SplitBillReceiptCard(props: SplitBillReceiptCardProps) {
  const {
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
    readySnapshot,
    canAddParticipant,
    canRemoveParticipant,
    onTitleChange,
    onMerchantAddressChange,
    onTotalBillChange,
    onSplitModeChange,
    onAddParticipant,
    onRemoveParticipant,
    onParticipantLabelChange,
    onParticipantAmountChange,
    onSubmit,
    onEditSummary,
    onReset,
  } = props;

  const addressPlaceholder =
    network === "mainnet" ? "bitcoincash:q..." : "bchtest:q...";

  return (
    <div className="retro-card overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b-2 border-[#161616] bg-[#FFD166] px-5 py-3">
        <div className="flex items-center gap-2">
          <Receipt className="size-4 text-[#161616]" aria-hidden="true" />
          <span className="font-display text-sm font-extrabold tracking-wide text-[#161616] uppercase">
            Table Receipt
          </span>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border-2 border-[#161616] px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase ${
            network === "mainnet"
              ? "bg-[#0AC18E] text-[#161616]"
              : "bg-[#FFFDF9] text-[#161616]"
          }`}
        >
          <span className="size-1.5 rounded-full bg-[#161616]" aria-hidden="true" />
          {network}
        </span>
      </div>

      <div className="p-5 sm:p-6">
        {readySnapshot ? (
          <ReceiptReadyPanel
            snapshot={readySnapshot}
            onEdit={onEditSummary}
            onReset={onReset}
          />
        ) : (
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label
                htmlFor="bill-title"
                className="text-xs font-bold tracking-wide text-[#161616] uppercase"
              >
                What are you splitting?
              </Label>
              <Input
                id="bill-title"
                placeholder="Dinner at Ramen House"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                aria-invalid={Boolean(fieldErrors.title)}
                className="h-10 rounded-xl border-2 border-[#161616] bg-[#FAF6EE] px-3 text-sm font-medium text-[#161616] placeholder:text-[#5B5347]/60 focus-visible:bg-[#FFFDF9]"
              />
              {fieldErrors.title ? (
                <p className="text-xs font-semibold text-[#E63946]">
                  {fieldErrors.title}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <Label
                  htmlFor="merchant-address"
                  className="text-xs font-bold tracking-wide text-[#161616] uppercase"
                >
                  Cashier BCH Address
                </Label>
                {isAddressValid ? (
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#0AC18E]">
                    <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    Valid {network}
                  </span>
                ) : null}
              </div>
              <Input
                id="merchant-address"
                placeholder={addressPlaceholder}
                value={merchantAddress}
                onChange={(e) => onMerchantAddressChange(e.target.value)}
                aria-invalid={Boolean(fieldErrors.merchantAddress)}
                className="h-10 rounded-xl border-2 border-[#161616] bg-[#FAF6EE] px-3 font-mono text-xs font-medium text-[#161616] placeholder:text-[#5B5347]/60 focus-visible:bg-[#FFFDF9]"
              />
              {fieldErrors.merchantAddress ? (
                <p className="text-xs font-semibold text-[#E63946]">
                  {fieldErrors.merchantAddress}
                </p>
              ) : null}
            </div>

            <div className="space-y-3">
              <Tabs
                value={splitMode}
                onValueChange={(val) => {
                  if (val === "equal" || val === "custom") {
                    onSplitModeChange(val);
                  }
                }}
              >
                <TabsList className="grid h-10 w-full grid-cols-2 rounded-xl border-2 border-[#161616] bg-[#FAF6EE] p-1">
                  <TabsTrigger
                    value="equal"
                    className="rounded-lg text-xs font-bold text-[#5B5347] data-active:border-2 data-active:border-[#161616] data-active:bg-[#FFD166] data-active:text-[#161616]"
                  >
                    Equal Split
                  </TabsTrigger>
                  <TabsTrigger
                    value="custom"
                    className="rounded-lg text-xs font-bold text-[#5B5347] data-active:border-2 data-active:border-[#161616] data-active:bg-[#FFD166] data-active:text-[#161616]"
                  >
                    Custom Slices
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {splitMode === "equal" ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="total-bill-bch"
                      className="text-xs font-bold tracking-wide text-[#161616] uppercase"
                    >
                      Total Bill (BCH)
                    </Label>
                    <span className="font-mono text-xs font-semibold text-[#5B5347]">
                      {formatSatsAsUsdApprox(summary.billTotalSats)} at $
                      {USD_PER_BCH_REF}/BCH
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      id="total-bill-bch"
                      inputMode="decimal"
                      placeholder="0.10"
                      value={totalBillInput}
                      onChange={(e) => onTotalBillChange(e.target.value)}
                      aria-invalid={Boolean(fieldErrors.amount)}
                      className="h-11 rounded-xl border-2 border-[#161616] bg-[#FAF6EE] pr-14 pl-3 font-mono text-base font-bold text-[#161616] placeholder:text-[#5B5347]/50 focus-visible:bg-[#FFFDF9]"
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 font-mono text-xs font-extrabold text-[#161616]">
                      BCH
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            <ParticipantRows
              participants={participants}
              splitMode={splitMode}
              customInputs={customInputs}
              participantErrors={fieldErrors.participants}
              canAdd={canAddParticipant}
              canRemove={canRemoveParticipant}
              onAdd={onAddParticipant}
              onRemove={onRemoveParticipant}
              onLabelChange={onParticipantLabelChange}
              onAmountChange={onParticipantAmountChange}
            />

            <ReceiptTotalsSection summary={summary} />

            <button
              type="submit"
              className="retro-btn inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0AC18E] px-5 py-3.5 font-display text-base font-extrabold text-[#161616]"
            >
              <span>Create Split Bill</span>
              <ArrowRight className="size-5" aria-hidden="true" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
