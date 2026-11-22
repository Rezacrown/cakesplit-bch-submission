import { AlertCircle, RefreshCw } from "lucide-react";
import type { PotProgress } from "@/lib/bch";
import {
  formatBchAmount,
  formatSatsCount,
  formatSyncTimestamp,
  formatUsdApprox,
} from "../_utils/billRoomHelpers";

interface PotProgressBarSectionProps {
  potProgress: PotProgress;
  priceUsd: number;
  isSettled: boolean;
  isRefreshing: boolean;
  networkError: string | null;
  lastSyncedAt: number | null;
  onRefreshPot: () => void;
}

export function PotProgressBarSection({
  potProgress,
  priceUsd,
  isSettled,
  isRefreshing,
  networkError,
  lastSyncedAt,
  onRefreshPot,
}: PotProgressBarSectionProps) {
  const clampedPercent = isSettled
    ? 100
    : Math.max(0, Math.min(100, potProgress.percent));
  const syncLabel = formatSyncTimestamp(lastSyncedAt);

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold tracking-wider text-[#18181B] uppercase">
            Shared Pot Progress
          </span>
          <button
            type="button"
            onClick={onRefreshPot}
            disabled={isRefreshing}
            aria-label="Refresh live Bitcoin Cash pot balance"
            title={syncLabel ? `Last synced ${syncLabel}` : "Refresh live pot"}
            className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#18181B]/20 bg-[#FAF9F6] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#111111] transition-colors hover:border-[#18181B] hover:bg-[#FFFFFF] disabled:opacity-60"
          >
            <RefreshCw
              className={`size-3 ${isRefreshing ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span>{isRefreshing ? "Syncing" : "Refresh"}</span>
          </button>
        </div>

        <div className="flex items-baseline gap-2 font-mono text-xs sm:text-sm">
          <span className="font-extrabold text-[#111111]">
            {formatSatsCount(potProgress.collectedSatoshis)} /{" "}
            {formatSatsCount(potProgress.potGoalSatoshis)} sats
          </span>
          <span className="text-[#A1A1AA]">/</span>
          <span className="font-bold text-[#52525B]">{clampedPercent}%</span>
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
          Collected: {formatBchAmount(potProgress.collectedSatoshis)} BCH (
          {formatUsdApprox(potProgress.collectedSatoshis, priceUsd)})
        </span>
        <span>
          Remaining: {formatBchAmount(potProgress.remainingSatoshis)} BCH (
          {formatUsdApprox(potProgress.remainingSatoshis, priceUsd)})
        </span>
      </div>

      {networkError ? (
        <p className="inline-flex items-center gap-1.5 rounded-xl border border-[#18181B]/25 bg-[#F4F4F5] px-3 py-2 text-xs font-medium text-[#111111]">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          <span>Fulcrum sync retrying: {networkError}</span>
        </p>
      ) : null}
    </div>
  );
}
