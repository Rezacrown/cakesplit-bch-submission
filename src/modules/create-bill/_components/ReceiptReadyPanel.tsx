import { CheckCircle2, PencilLine, RotateCcw } from "lucide-react";
import {
  formatSatsAsBch,
  formatSatsAsUsdApprox,
  truncateCashAddress,
  type ValidatedBillSnapshot,
} from "../_utils/billFormMath";

interface ReceiptReadyPanelProps {
  snapshot: ValidatedBillSnapshot;
  onEdit: () => void;
  onReset: () => void;
}

export function ReceiptReadyPanel({
  snapshot,
  onEdit,
  onReset,
}: ReceiptReadyPanelProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 border-[#161616] bg-[#0AC18E]/20 p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-[#161616] bg-[#0AC18E] text-[#161616]">
            <CheckCircle2 className="size-5" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <p className="font-display text-base font-extrabold text-[#161616]">
              Table Check Ready
            </p>
            <p className="text-xs leading-relaxed text-[#161616]/80">
              Your split summary is verified for{" "}
              <strong className="uppercase">{snapshot.network}</strong> and
              ready to open a shared table pot.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 rounded-xl border-2 border-dashed border-[#161616]/40 bg-[#FAF6EE] p-4 text-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#5B5347]">Bill</span>
          <span className="font-display font-bold text-[#161616]">
            {snapshot.title}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#5B5347]">Cashier</span>
          <span className="font-mono text-xs font-semibold text-[#161616]">
            {truncateCashAddress(snapshot.merchantAddress)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#5B5347]">Table</span>
          <span className="font-semibold text-[#161616]">
            {snapshot.participants.length} people (
            {snapshot.splitMode === "equal" ? "Equal Split" : "Custom Slices"})
          </span>
        </div>

        <div className="receipt-perforation pt-2.5">
          <ul className="space-y-1.5">
            {snapshot.participants.map((person) => (
              <li
                key={person.id}
                className="flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-[#161616]">
                  {person.label}
                </span>
                <span className="font-mono font-bold text-[#161616]">
                  {formatSatsAsBch(person.shareSatoshis)} BCH{" "}
                  <span className="font-normal text-[#5B5347]">
                    ({formatSatsAsUsdApprox(person.shareSatoshis)})
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="receipt-perforation flex items-baseline justify-between pt-2.5">
          <span className="text-xs font-extrabold tracking-wide text-[#161616] uppercase">
            Shared Pot Target
          </span>
          <div className="text-right">
            <p className="font-mono text-base font-extrabold text-[#161616]">
              {formatSatsAsBch(snapshot.sharedPotTargetSats)} BCH
            </p>
            <p className="font-mono text-[11px] text-[#5B5347]">
              Includes {snapshot.networkFeeSats} sats settlement fee (
              {formatSatsAsUsdApprox(snapshot.sharedPotTargetSats)})
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={onEdit}
          className="retro-btn-sm inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#FFD166] px-3 py-2.5 text-sm font-bold text-[#161616]"
        >
          <PencilLine className="size-4" aria-hidden="true" />
          <span>Edit Check</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="retro-btn-sm inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#FFFDF9] px-3 py-2.5 text-sm font-bold text-[#161616]"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          <span>New Table</span>
        </button>
      </div>
    </div>
  );
}
