import { Plus, Trash2, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { SplitParticipantDraft } from "@/store/app-store";
import { MAX_PARTICIPANTS, type SplitMode } from "../constants";
import { formatSatsAsBch, formatSatsAsUsdApprox } from "../_utils/billFormMath";

interface ParticipantRowsProps {
  participants: SplitParticipantDraft[];
  splitMode: SplitMode;
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
  customInputs,
  participantErrors,
  canAdd,
  canRemove,
  onAdd,
  onRemove,
  onLabelChange,
  onAmountChange,
}: ParticipantRowsProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide text-[#161616] uppercase">
          <Users className="size-3.5" aria-hidden="true" />
          People at the table
        </span>
        <span className="font-mono text-xs font-semibold text-[#5B5347]">
          {participants.length} / {MAX_PARTICIPANTS} seats
        </span>
      </div>

      <div className="max-h-60 space-y-2 overflow-y-auto pr-0.5">
        {participants.map((person, index) => {
          const rowError = participantErrors?.[person.id];
          return (
            <div key={person.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex size-7 shrink-0 items-center justify-center rounded-lg border-2 border-[#161616] bg-[#FFD166] font-mono text-xs font-bold text-[#161616]"
                >
                  {index + 1}
                </span>

                <Input
                  aria-label={`Person ${index + 1} name`}
                  placeholder={`Friend ${index + 1}`}
                  value={person.label}
                  onChange={(e) => onLabelChange(person.id, e.target.value)}
                  className="h-9 flex-1 rounded-lg border-2 border-[#161616] bg-[#FAF6EE] px-2.5 text-sm font-medium text-[#161616] placeholder:text-[#5B5347]/60 focus-visible:bg-[#FFFDF9]"
                />

                {splitMode === "equal" ? (
                  <div className="flex h-9 min-w-[116px] flex-col items-end justify-center rounded-lg border-2 border-dashed border-[#161616]/35 bg-[#FAF6EE] px-2.5 text-right">
                    <span className="font-mono text-xs font-bold text-[#161616]">
                      {person.shareSatoshis > 0
                        ? `${formatSatsAsBch(person.shareSatoshis)} BCH`
                        : "0 BCH"}
                    </span>
                    <span className="font-mono text-[10px] text-[#5B5347]">
                      {formatSatsAsUsdApprox(person.shareSatoshis)}
                    </span>
                  </div>
                ) : (
                  <div className="relative w-32 shrink-0">
                    <Input
                      aria-label={`${person.label || `Person ${index + 1}`} slice in BCH`}
                      inputMode="decimal"
                      placeholder="0.00"
                      value={customInputs[person.id] ?? ""}
                      onChange={(e) =>
                        onAmountChange(person.id, e.target.value)
                      }
                      className="h-9 rounded-lg border-2 border-[#161616] bg-[#FAF6EE] pr-11 pl-2.5 font-mono text-sm font-semibold text-[#161616] placeholder:text-[#5B5347]/55 focus-visible:bg-[#FFFDF9]"
                    />
                    <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 font-mono text-[11px] font-bold text-[#5B5347]">
                      BCH
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={!canRemove}
                  onClick={() => onRemove(person.id)}
                  aria-label={`Remove ${person.label || `person ${index + 1}`}`}
                  className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border-2 border-[#161616] bg-[#FFFDF9] text-[#161616] transition-colors hover:bg-[#E63946] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>

              {rowError ? (
                <p className="pl-9 text-xs font-semibold text-[#E63946]">
                  {rowError}
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
        className="retro-btn-sm inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#FAF6EE] px-3 py-2 text-xs font-bold text-[#161616] hover:bg-[#FFD166]/45 disabled:cursor-not-allowed disabled:opacity-45"
      >
        <Plus className="size-3.5" aria-hidden="true" />
        <span>
          {canAdd ? "Add Another Person" : "Table Full (12 People Max)"}
        </span>
      </button>
    </div>
  );
}
