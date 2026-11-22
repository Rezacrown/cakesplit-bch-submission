import { Info } from "lucide-react";
import {
  formatSatsAsBch,
  formatSatsAsUsdApprox,
  type BillSummaryMetrics,
} from "../_utils/billFormMath";

interface ReceiptTotalsSectionProps {
  summary: BillSummaryMetrics;
}

export function ReceiptTotalsSection({ summary }: ReceiptTotalsSectionProps) {
  return (
    <div className="receipt-perforation space-y-2.5 pt-4 text-xs">
      <div className="flex items-center justify-between text-[#52525B]">
        <span className="font-semibold">Bill subtotal to cashier</span>
        <span className="font-mono font-bold text-[#111111]">
          {formatSatsAsBch(summary.billTotalSats)} BCH{" "}
          <span className="font-normal text-[#71717A]">
            ({formatSatsAsUsdApprox(summary.billTotalSats)})
          </span>
        </span>
      </div>

      <div className="flex items-start justify-between gap-2 text-[#52525B]">
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <Info className="size-3.5 shrink-0 text-[#71717A]" aria-hidden="true" />
          Network settlement fee
        </span>
        <span className="text-right font-mono font-semibold text-[#111111]">
          {summary.networkFeeSats.toLocaleString()} sats{" "}
          <span className="font-normal text-[#71717A]">(&lt;$0.01)</span>
        </span>
      </div>

      <p className="text-[11px] leading-relaxed text-[#71717A]">
        A fixed 500-sat fee reserve is built into the pot so anyone at the table
        can pay the cashier in one tap once full.
      </p>

      <div className="receipt-perforation flex items-baseline justify-between pt-3.5">
        <span className="font-display text-sm font-extrabold tracking-wide text-[#111111] uppercase">
          Total Pot Goal
        </span>
        <div className="text-right">
          <p className="font-mono text-lg font-extrabold text-[#111111]">
            {formatSatsAsBch(summary.sharedPotTargetSats)} BCH
          </p>
          <p className="font-mono text-[11px] font-medium text-[#71717A]">
            {summary.sharedPotTargetSats.toLocaleString()} sats (
            {formatSatsAsUsdApprox(summary.sharedPotTargetSats)})
          </p>
        </div>
      </div>
    </div>
  );
}
