import { AlertCircle, Plus, Trash2, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { SplitParticipantDraft } from "@/store/app-store";
import {
  MAX_PARTICIPANTS,
  type InputCurrencyUnit,
  type SplitMode,
} from "../constants";
import {
  formatSatsAsBch,
  formatUsdFromSatoshis,
} from "../_utils/billFormMath";

interface ParticipantRowsProps {
  participants: SplitParticipantDraft[];
  splitMode: SplitMode;
  inputUnit: InputCurrencyUnit;
  priceUsd: number;
  customInputs: Record<string, string>;
  participantErrors?: Record<string, string>;
  canAdd: boolean;
  canRemove: boolean;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onLabelChange: (id: string, label: string) => void;
  onAmountChange: (id: string, value: string) => void;
}

export function ParticipantRows({
  participants,
  splitMode,
  inputUnit,
  priceUsd,
  customInputs,
  participantErrors,
  canAdd,
  canRemove,
  onAdd,
  onRemove,
  onLabelChange,
  onAmountChange,
}: ParticipantRowsProps) {
  const isUsd = inputUnit === "usd";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider text-[#18181B] uppercase">
          <Users className="size-3.5 text-[#52525B]" aria-hidden="true" />
          People at the table
        </span>
        <span className="font-mono text-xs font-semibold text-[#71717A]">
          {participants.length} / {MAX_PARTICIPANTS} seats
        </span>
      </div>

      <div className="max-h-72 space-y-2.5 overflow-y-auto pr-0.5">
        {participants.map((person, index) => {
          const rowError = participantErrors?.[person.id];
          const bchLabel = `${formatSatsAsBch(person.shareSatoshis)} BCH`;
          const usdLabel = formatUsdFromSatoshis(person.shareSatoshis, priceUsd);

          return (
            <div key={person.id} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-[#18181B]/20 bg-[#F4F4F5] font-mono text-xs font-bold text-[#111111]"
                >
                  {index + 1}
                </span>

                <Input
                  aria-label={`Person ${index + 1} name`}
                  placeholder={`Friend ${index + 1}`}
                  value={person.label}
                  onChange={(e) => onLabelChange(person.id, e.target.value)}
                  className="h-10 flex-1 rounded-xl border-[1.5px] border-[#18181B]/20 bg-[#FAF9F6] px-3 text-sm font-medium text-[#111111] placeholder:text-[#71717A]/70 focus-visible:border-[#18181B] focus-visible:bg-[#FFFFFF]"
                />

                {splitMode === "equal" ? (
                  <div className="flex h-10 min-w-[136px] flex-col items-end justify-center rounded-xl border border-dashed border-[#18181B]/25 bg-[#F4F4F5]/75 px-3 text-right">
                    <span className="font-mono text-xs font-bold text-[#111111]">
                      {isUsd ? usdLabel : bchLabel}
                    </span>
                    <span className="font-mono text-[10px] text-[#71717A]">
                      {isUsd
                        ? `${bchLabel} / ${person.shareSatoshis.toLocaleString()} sats`
                        : `${usdLabel} / ${person.shareSatoshis.toLocaleString()} sats`}
                    </span>
                  </div>
                ) : (
                  <div className="relative w-32 shrink-0">
                    {isUsd ? (
                      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 font-mono text-xs font-bold text-[#52525B]">
                        $
                      </span>
                    ) : null}
                    <Input
                      aria-label={`${person.label || `Person ${index + 1}`} slice in ${isUsd ? "USD" : "BCH"}`}
                      inputMode="decimal"
                      placeholder={isUsd ? "20.00" : "0.00"}
                      value={customInputs[person.id] ?? ""}
                      onChange={(e) =>
                        onAmountChange(person.id, e.target.value)
                      }
                      className={`h-10 rounded-xl border-[1.5px] border-[#18181B]/20 bg-[#FAF9F6] font-mono text-sm font-semibold text-[#111111] placeholder:text-[#71717A]/60 focus-visible:border-[#18181B] focus-visible:bg-[#FFFFFF] ${
                        isUsd ? "pr-3 pl-6" : "pr-11 pl-3"
                      }`}
                    />
                    {!isUsd ? (
                      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-mono text-[11px] font-bold text-[#71717A]">
                        BCH
                      </span>
                    ) : null}
                  </div>
                )}

                <button
                  type="button"
                  disabled={!canRemove}
                  onClick={() => onRemove(person.id)}
                  aria-label={`Remove ${person.label || `person ${index + 1}`}`}
                  className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] text-[#52525B] transition-colors hover:border-[#18181B] hover:bg-[#18181B] hover:text-[#FAF9F6] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>

              {splitMode === "custom" ? (
                <p className="pl-10 font-mono text-[10px] text-[#71717A]">
                  {isUsd
                    ? `${bchLabel} (${person.shareSatoshis.toLocaleString()} sats)`
                    : `${usdLabel} (${person.shareSatoshis.toLocaleString()} sats)`}
                </p>
              ) : null}

              {rowError ? (
                <p className="inline-flex items-center gap-1.5 pl-10 text-xs font-semibold text-[#18181B]">
                  <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                  <span>{rowError}</span>
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!canAdd}
        onClick={onAdd}
        className="ink-pill-secondary inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-45"
      >
        <Plus className="size-3.5" aria-hidden="true" />
        <span>
          {canAdd ? "Add Another Person" : "Table Full (12 People Max)"}
        </span>
      </button>
    </div>
  );
}
