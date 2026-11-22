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
    <div className="receipt-perforation space-y-2 pt-4 text-xs">
      <div className="flex items-center justify-between text-[#5B5347]">
        <span className="font-semibold">Bill to cashier</span>
        <span className="font-mono font-bold text-[#161616]">
          {formatSatsAsBch(summary.billTotalSats)} BCH{" "}
          <span className="font-normal text-[#5B5347]">
            ({formatSatsAsUsdApprox(summary.billTotalSats)})
          </span>
        </span>
      </div>

      <div className="flex items-start justify-between gap-2 text-[#5B5347]">
        <span className="inline-flex items-center gap-1 font-semibold">
          <Info className="size-3.5 shrink-0" aria-hidden="true" />
          Network settlement fee
        </span>
        <span className="text-right font-mono font-semibold text-[#161616]">
          {summary.networkFeeSats} sats{" "}
          <span className="font-normal text-[#5B5347]">(&lt;$0.01)</span>
        </span>
      </div>

      <p className="text-[11px] leading-snug text-[#5B5347]">
        A tiny 500-sat buffer covers the final payout transaction to the cashier
        once everyone has chipped in.
      </p>

      <div className="receipt-perforation flex items-baseline justify-between pt-3">
        <span className="font-display text-sm font-extrabold text-[#161616] uppercase">
          Shared Pot Target
        </span>
        <div className="text-right">
          <p className="font-mono text-lg font-extrabold text-[#161616]">
            {formatSatsAsBch(summary.sharedPotTargetSats)} BCH
          </p>
          <p className="font-mono text-[11px] font-medium text-[#5B5347]">
            {formatSatsAsUsdApprox(summary.sharedPotTargetSats)}
          </p>
        </div>
      </div>
    </div>
  );
}
