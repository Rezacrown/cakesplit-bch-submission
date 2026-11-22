import {
  CheckCircle2,
  Clock,
  Copy,
  Link2,
  QrCode,
  RotateCcw,
  Wallet,
} from "lucide-react";
import type { ContractPotState, PotProgress } from "@/lib/bch";
import type { BroadcastReceipt } from "@/services/client/billNetworkService";
import type { CompiledBillRoomState } from "../_utils/billRoomHelpers";
import {
  formatBchAmount,
  formatNetworkBadge,
  formatUsdApprox,
  truncateMiddle,
} from "../_utils/billRoomHelpers";
import { PotProgressBarSection } from "./PotProgressBarSection";

interface BillReceiptHeaderProps {
  state: CompiledBillRoomState;
  potProgress: PotProgress;
  potState: ContractPotState | null;
  priceUsd: number;
  broadcastReceipt: BroadcastReceipt | null;
  isRefreshing: boolean;
  networkError: string | null;
  lastSyncedAt: number | null;
  onRefreshPot: () => void;
  onCopyBillLink: () => void;
  onOpenShareQr: () => void;
  onCopyPotAddress: () => void;
}

export function BillReceiptHeader({
  state,
  potProgress,
  potState,
  priceUsd,
  broadcastReceipt,
  isRefreshing,
  networkError,
  lastSyncedAt,
  onRefreshPot,
  onCopyBillLink,
  onOpenShareQr,
  onCopyPotAddress,
}: BillReceiptHeaderProps) {
  const { bill, contract } = state;
  const isSettled = broadcastReceipt?.kind === "settled";
  const isCancelled = broadcastReceipt?.kind === "cancelled";

  const statusLabel = isSettled
    ? "Settled to Cashier"
    : isCancelled
      ? "Refunded"
      : potProgress.isReadyToSettle
        ? "Ready to Settle"
        : "Waiting for Shares";

  const mascotSrc = isSettled
    ? "/mascots/party.png"
    : isCancelled
      ? "/mascots/step-success.png"
      : potProgress.isReadyToSettle
        ? "/mascots/happy.png"
        : "/mascots/step-pay.png";

  const mascotAlt = isSettled
    ? "CakeSplit mascot celebrating a paid table check"
    : isCancelled
      ? "CakeSplit mascot confirming table refund"
      : potProgress.isReadyToSettle
        ? "CakeSplit mascot celebrating a funded table pot"
        : "CakeSplit mascot waiting for friends to chip in";

  const hasUnconfirmed = Boolean(potState && potState.unconfirmedSatoshis > 0n);
  const hasConfirmedOnly = Boolean(
    potState &&
      potState.confirmedSatoshis > 0n &&
      potState.unconfirmedSatoshis === 0n,
  );

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
                  isSettled || potProgress.isReadyToSettle
                    ? "border-[#18181B] bg-[#18181B] text-[#FAF9F6]"
                    : "border-[#18181B]/25 bg-[#FFFFFF] text-[#111111]"
                }`}
              >
                {isCancelled ? (
                  <RotateCcw className="size-3.5" aria-hidden="true" />
                ) : isSettled || potProgress.isReadyToSettle ? (
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                ) : (
                  <Clock className="size-3.5" aria-hidden="true" />
                )}
                <span>{statusLabel}</span>
              </span>

              {!broadcastReceipt && hasUnconfirmed ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#18181B]/40 bg-[#FFFFFF] px-2.5 py-1 font-mono text-[10px] font-bold text-[#111111]">
                  0-conf Mempool
                </span>
              ) : null}

              {!broadcastReceipt && hasConfirmedOnly ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#18181B]/25 bg-[#FFFFFF] px-2.5 py-1 font-mono text-[10px] font-bold text-[#111111]">
                  Confirmed On-Chain
                </span>
              ) : null}
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
                ({formatUsdApprox(contract.potGoalSatoshis, priceUsd)}) into one
                shared table pot.
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
        <PotProgressBarSection
          potProgress={potProgress}
          priceUsd={priceUsd}
          isSettled={isSettled}
          isRefreshing={isRefreshing}
          networkError={networkError}
          lastSyncedAt={lastSyncedAt}
          onRefreshPot={onRefreshPot}
        />

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
