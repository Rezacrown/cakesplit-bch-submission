import { CheckCircle2, Clock, Copy, Link2, QrCode, Wallet } from "lucide-react";
import type { CompiledBillRoomState } from "../_utils/billRoomHelpers";
import {
  formatBchAmount,
  formatNetworkBadge,
  formatSatsCount,
  formatUsdApprox,
  truncateMiddle,
} from "../_utils/billRoomHelpers";

interface BillReceiptHeaderProps {
  state: CompiledBillRoomState;
  onCopyBillLink: () => void;
  onOpenShareQr: () => void;
  onCopyPotAddress: () => void;
}

export function BillReceiptHeader({
  state,
  onCopyBillLink,
  onOpenShareQr,
  onCopyPotAddress,
}: BillReceiptHeaderProps) {
  const { bill, contract, potProgress } = state;
  const statusLabel = potProgress.isReadyToSettle
    ? "Ready to Settle"
    : "Waiting for Shares";
  const mascotSrc = potProgress.isReadyToSettle
    ? "/mascots/happy.png"
    : "/mascots/step-pay.png";
  const mascotAlt = potProgress.isReadyToSettle
    ? "CakeSplit mascot celebrating a funded table pot"
    : "CakeSplit mascot waiting for friends to chip in";
  const clampedPercent = Math.max(0, Math.min(100, potProgress.percent));

  return (
    <div className="ink-card overflow-hidden rounded-3xl">
      <div className="paper-stipple border-b-[1.5px] border-[#18181B]/12 bg-[#F4F4F5] px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#18181B]/25 bg-[#FFFFFF] px-3 py-1 font-mono text-[11px] font-bold text-[#111111]">
                <span
                  className="size-1.5 rounded-full bg-[#18181B]"
                  aria-hidden="true"
                />
                {formatNetworkBadge(bill.network)}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-bold ${
                  potProgress.isReadyToSettle
                    ? "border-[#18181B] bg-[#18181B] text-[#FAF9F6]"
                    : "border-[#18181B]/25 bg-[#FFFFFF] text-[#111111]"
                }`}
              >
                {potProgress.isReadyToSettle ? (
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                ) : (
                  <Clock className="size-3.5" aria-hidden="true" />
                )}
                <span>{statusLabel}</span>
              </span>
            </div>

            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#111111] sm:text-4xl">
                {bill.title}
              </h1>
              <p className="mt-1 text-sm text-[#52525B]">
                {bill.participants.length} people splitting{" "}
                <span className="font-mono font-semibold text-[#111111]">
                  {formatBchAmount(contract.potGoalSatoshis)} BCH
                </span>{" "}
                ({formatUsdApprox(contract.potGoalSatoshis)}) into one shared
                table pot.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-center self-start md:self-center">
            <div className="flex size-24 items-center justify-center rounded-2xl border-[1.5px] border-dashed border-[#18181B]/25 bg-[#FFFFFF] p-2.5 sm:size-28">
              <img
                src={mascotSrc}
                alt={mascotAlt}
                width={92}
                height={92}
                className="animate-mascot-float h-20 w-auto object-contain sm:h-22"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-7">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-mono text-xs font-bold tracking-wider text-[#18181B] uppercase">
              Shared Pot Progress
            </span>
            <div className="flex items-baseline gap-2 font-mono text-xs sm:text-sm">
              <span className="font-extrabold text-[#111111]">
                {formatSatsCount(potProgress.collectedSatoshis)} /{" "}
                {formatSatsCount(potProgress.potGoalSatoshis)} sats
              </span>
              <span className="text-[#A1A1AA]">/</span>
              <span className="font-bold text-[#52525B]">
                {clampedPercent}%
              </span>
            </div>
          </div>

          <div
            role="progressbar"
            aria-label="Shared pot funding progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={clampedPercent}
            className="relative h-4 w-full overflow-hidden rounded-full border-[1.5px] border-[#18181B] bg-[#FAF9F6]"
          >
            <div
              className="h-full rounded-full bg-[#18181B] transition-all duration-500"
              style={{
                width: `${clampedPercent}%`,
                backgroundImage:
                  "repeating-linear-gradient(-45deg, rgba(250,249,246,0.14) 0px, rgba(250,249,246,0.14) 6px, transparent 6px, transparent 12px)",
              }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-[#71717A]">
            <span>
              Collected: {formatBchAmount(potProgress.collectedSatoshis)} BCH
            </span>
            <span>
              Remaining: {formatBchAmount(potProgress.remainingSatoshis)} BCH (
              {formatSatsCount(potProgress.remainingSatoshis)} sats)
            </span>
          </div>
        </div>

        <div className="receipt-perforation flex flex-wrap items-center justify-between gap-3 pt-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onCopyBillLink}
              className="ink-pill-primary inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold"
            >
              <Link2 className="size-3.5" aria-hidden="true" />
              <span>Copy Bill Link</span>
            </button>

            <button
              type="button"
              onClick={onOpenShareQr}
              className="ink-pill-secondary inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold"
            >
              <QrCode className="size-3.5" aria-hidden="true" />
              <span>Show Share QR</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onCopyPotAddress}
            title={`Copy Pot Address: ${contract.contractAddress}`}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#18181B]/25 bg-[#F4F4F5] px-3.5 py-2 font-mono text-[11px] font-semibold text-[#111111] transition-colors hover:border-[#18181B] hover:bg-[#FFFFFF]"
          >
            <Wallet className="size-3.5 text-[#52525B]" aria-hidden="true" />
            <span className="hidden text-[#71717A] sm:inline">Pot:</span>
            <span>{truncateMiddle(contract.contractAddress, 16, 7)}</span>
            <Copy className="size-3 text-[#52525B]" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
