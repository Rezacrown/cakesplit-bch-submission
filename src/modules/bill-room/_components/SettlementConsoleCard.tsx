import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Copy,
  FileCode2,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { SETTLEMENT_CONSOLE_COPY } from "../constants";
import type { CompiledBillRoomState } from "../_utils/billRoomHelpers";
import {
  formatBchAmount,
  formatSatsCount,
  formatUsdApprox,
  truncateMiddle,
} from "../_utils/billRoomHelpers";

interface SettlementConsoleCardProps {
  state: CompiledBillRoomState;
  onCopyCashierAddress: () => void;
}

export function SettlementConsoleCard({
  state,
  onCopyCashierAddress,
}: SettlementConsoleCardProps) {
  const { bill, contract, potProgress, token } = state;

  return (
    <div className="flex flex-col gap-5">
      <div className="ink-card overflow-hidden rounded-3xl">
        <div className="flex items-center justify-between border-b-[1.5px] border-[#18181B]/12 bg-[#F4F4F5] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-[#111111]" aria-hidden="true" />
            <h2 className="font-display text-base font-extrabold text-[#111111]">
              {SETTLEMENT_CONSOLE_COPY.heading}
            </h2>
          </div>
          <span className="font-mono text-[11px] font-bold text-[#71717A] uppercase">
            P2SH32 Pot
          </span>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="space-y-2.5 rounded-2xl border border-[#E4E4E7] bg-[#FAF9F6] p-4 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-[#52525B]">
                Cashier destination
              </span>
              <button
                type="button"
                onClick={onCopyCashierAddress}
                title={`Copy cashier address: ${bill.merchantAddress}`}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#18181B]/20 bg-[#FFFFFF] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#111111] transition-colors hover:border-[#18181B]"
              >
                <span>{truncateMiddle(bill.merchantAddress, 14, 6)}</span>
                <Copy className="size-3 text-[#52525B]" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-[#52525B]">
                Net cashier payout
              </span>
              <span className="font-mono font-bold text-[#111111]">
                {formatBchAmount(contract.merchantPayoutSatoshis)} BCH{" "}
                <span className="font-normal text-[#71717A]">
                  ({formatUsdApprox(contract.merchantPayoutSatoshis)})
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-[#52525B]">
                Network settlement fee
              </span>
              <span className="font-mono font-semibold text-[#111111]">
                {formatSatsCount(contract.settlementFeeSatoshis)} sats
              </span>
            </div>

            <div className="receipt-perforation flex items-center justify-between gap-2 pt-2.5">
              <span className="font-bold text-[#111111]">Total pot target</span>
              <span className="font-mono text-sm font-extrabold text-[#111111]">
                {formatBchAmount(contract.potGoalSatoshis)} BCH
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              disabled={!potProgress.isReadyToSettle}
              className="ink-pill-primary inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-3.5 font-display text-sm font-bold disabled:cursor-not-allowed disabled:opacity-45"
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />
              <span>{SETTLEMENT_CONSOLE_COPY.settleCta}</span>
            </button>
            <p className="text-center text-[11px] leading-relaxed text-[#71717A]">
              {SETTLEMENT_CONSOLE_COPY.settleCaption}
            </p>
          </div>

          <div className="receipt-perforation space-y-2 pt-4">
            <button
              type="button"
              disabled={!potProgress.canOrganizerCancel}
              className="ink-pill-secondary inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-45"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              <span>{SETTLEMENT_CONSOLE_COPY.cancelCta}</span>
            </button>
            <p className="text-center text-[11px] leading-relaxed text-[#71717A]">
              {SETTLEMENT_CONSOLE_COPY.cancelCaption}
            </p>
          </div>
        </div>
      </div>

      <Link
        href={`/xo?d=${encodeURIComponent(token)}`}
        className="ink-card-soft group flex items-center justify-between gap-4 rounded-2xl p-4 transition-colors hover:border-[#18181B] hover:bg-[#FFFFFF]"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#18181B]/20 bg-[#FFFFFF] text-[#111111]">
            <FileCode2 className="size-4" aria-hidden="true" />
          </span>
          <div className="space-y-0.5">
            <p className="font-display text-sm font-extrabold text-[#111111]">
              {SETTLEMENT_CONSOLE_COPY.xoLinkTitle}
            </p>
            <p className="text-xs leading-relaxed text-[#52525B]">
              {SETTLEMENT_CONSOLE_COPY.xoLinkSubtitle}
            </p>
          </div>
        </div>
        <ArrowUpRight
          className="size-4 shrink-0 text-[#52525B] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#111111]"
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}
