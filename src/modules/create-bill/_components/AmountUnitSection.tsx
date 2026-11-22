import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { InputCurrencyUnit, SplitMode } from "../constants";
import {
  formatSatsAsBch,
  formatUsdFromSatoshis,
} from "../_utils/billFormMath";

interface AmountUnitSectionProps {
  splitMode: SplitMode;
  inputUnit: InputCurrencyUnit;
  priceUsd: number;
  totalBillInput: string;
  billTotalSats: number;
  hasAmountError: boolean;
  onSplitModeChange: (mode: SplitMode) => void;
  onInputUnitChange: (unit: InputCurrencyUnit) => void;
  onTotalBillChange: (value: string) => void;
}

const CURRENCY_UNITS: { value: InputCurrencyUnit; label: string }[] = [
  { value: "usd", label: "USD" },
  { value: "bch", label: "BCH" },
];

export function AmountUnitSection({
  splitMode,
  inputUnit,
  priceUsd,
  totalBillInput,
  billTotalSats,
  hasAmountError,
  onSplitModeChange,
  onInputUnitChange,
  onTotalBillChange,
}: AmountUnitSectionProps) {
  const isUsd = inputUnit === "usd";

  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <Tabs
          value={splitMode}
          onValueChange={(val) => {
            if (val === "equal" || val === "custom") {
              onSplitModeChange(val);
            }
          }}
          className="flex-1"
        >
          <TabsList className="grid h-10 w-full grid-cols-2 rounded-full border border-[#E4E4E7] bg-[#F4F4F5] p-1">
            <TabsTrigger
              value="equal"
              className="rounded-full text-xs font-bold text-[#52525B] data-active:bg-[#18181B] data-active:text-[#FAF9F6]"
            >
              Equal Split
            </TabsTrigger>
            <TabsTrigger
              value="custom"
              className="rounded-full text-xs font-bold text-[#52525B] data-active:bg-[#18181B] data-active:text-[#FAF9F6]"
            >
              Custom Slices
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div
          role="group"
          aria-label="Input currency unit"
          className="inline-flex h-10 shrink-0 items-center rounded-full border border-[#E4E4E7] bg-[#F4F4F5] p-1"
        >
          {CURRENCY_UNITS.map((unit) => {
            const selected = inputUnit === unit.value;
            return (
              <button
                key={unit.value}
                type="button"
                onClick={() => onInputUnitChange(unit.value)}
                aria-pressed={selected}
                className={`cursor-pointer rounded-full px-3 py-1 font-mono text-xs font-bold transition-all ${
                  selected
                    ? "bg-[#18181B] text-[#FAF9F6] shadow-xs"
                    : "text-[#52525B] hover:text-[#111111]"
                }`}
              >
                {unit.label}
              </button>
            );
          })}
        </div>
      </div>

      {splitMode === "equal" ? (
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <Label
              htmlFor="total-bill-amount"
              className="font-mono text-[11px] font-bold tracking-wider text-[#18181B] uppercase"
            >
              Total Bill ({isUsd ? "USD" : "BCH"})
            </Label>
            <span className="font-mono text-xs font-medium text-[#52525B]">
              {isUsd
                ? `${formatSatsAsBch(billTotalSats)} BCH (${billTotalSats.toLocaleString()} sats)`
                : `${formatUsdFromSatoshis(billTotalSats, priceUsd)} (${billTotalSats.toLocaleString()} sats)`}
            </span>
          </div>
          <div className="relative">
            {isUsd ? (
              <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 font-mono text-base font-extrabold text-[#111111]">
                $
              </span>
            ) : null}
            <Input
              id="total-bill-amount"
              inputMode="decimal"
              placeholder={isUsd ? "40.00" : "0.10"}
              value={totalBillInput}
              onChange={(e) => onTotalBillChange(e.target.value)}
              aria-invalid={hasAmountError}
              className={`h-12 rounded-xl border-[1.5px] border-[#18181B]/20 bg-[#FAF9F6] font-mono text-base font-bold text-[#111111] placeholder:text-[#71717A]/60 focus-visible:border-[#18181B] focus-visible:bg-[#FFFFFF] ${
                isUsd ? "pr-14 pl-8" : "pr-14 pl-3.5"
              }`}
            />
            <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 font-mono text-xs font-extrabold text-[#111111]">
              {isUsd ? "USD" : "BCH"}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
