import { ArrowUpRight, CheckCircle2, Copy, RotateCcw } from "lucide-react";
import { appConfig } from "@/lib/config/env";
import type { BroadcastReceipt } from "@/services/client/billNetworkService";
import {
  formatBchAmount,
  formatSatsCount,
  formatUsdApprox,
  truncateMiddle,
} from "../_utils/billRoomHelpers";

interface BroadcastReceiptCardProps {
  receipt: BroadcastReceipt;
  priceUsd: number;
  onCopyInvitationJson: () => void;
}

const BLAZE_XO_URL = appConfig.xoDebugToolUrl;

export function BroadcastReceiptCard({
  receipt,
  priceUsd,
  onCopyInvitationJson,
}: BroadcastReceiptCardProps) {
  const isSettled = receipt.kind === "settled";
  const amountSatoshis = isSettled
    ? receipt.merchantPaidSatoshis
    : receipt.refundedSatoshis;

  return (
    <div className="space-y-4 rounded-2xl border-[1.75px] border-[#18181B] bg-[#FAF9F6] p-4 sm:p-5">
      <div className="flex items-center gap-3.5">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border-[1.5px] border-dashed border-[#18181B]/30 bg-[#FFFFFF] p-2">
          <img
            src={isSettled ? "/mascots/party.png" : "/mascots/step-success.png"}
            alt={
              isSettled
                ? "CakeSplit mascot celebrating cashier settlement"
                : "CakeSplit mascot confirming table refund"
            }
            width={56}
            height={56}
            className="h-12 w-auto object-contain"
          />
        </div>

        <div className="min-w-0 space-y-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#18181B] px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-[#FAF9F6] uppercase">
            {isSettled ? (
              <CheckCircle2 className="size-3" aria-hidden="true" />
            ) : (
              <RotateCcw className="size-3" aria-hidden="true" />
            )}
            <span>{isSettled ? "Settled On-Chain" : "Refunded On-Chain"}</span>
          </span>
          <h3 className="font-display text-lg font-extrabold text-[#111111]">
            {isSettled
              ? "Cashier Paid on BCH Mainnet"
              : "Table Pot Refunded"}
          </h3>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] p-3.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-[#52525B]">
            {isSettled ? "Net paid to cashier" : "Net refunded"}
          </span>
          <span className="font-mono font-bold text-[#111111]">
            {formatBchAmount(amountSatoshis)} BCH{" "}
            <span className="font-normal text-[#71717A]">
              ({formatUsdApprox(amountSatoshis, priceUsd)})
            </span>
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-[#52525B]">Miner fee</span>
          <span className="font-mono font-semibold text-[#111111]">
            {formatSatsCount(receipt.feeSatoshis)} sats
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-[#52525B]">Transaction ID</span>
          <a
            href={receipt.explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-mono font-bold text-[#111111] underline decoration-[#18181B]/35 underline-offset-2 hover:decoration-[#18181B]"
          >
            <span>{truncateMiddle(receipt.txid, 10, 8)}</span>
            <ArrowUpRight className="size-3" aria-hidden="true" />
          </a>
        </div>
      </div>

      {receipt.historyEntries && receipt.historyEntries.length > 0 ? (
        <div className="space-y-2 rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] p-3.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] font-bold tracking-wider text-[#52525B] uppercase">
              On-Chain Bill History
            </span>
            <span className="font-mono text-[10px] font-semibold text-[#71717A]">
              {receipt.historyEntries.length}{" "}
              {receipt.historyEntries.length === 1 ? "tx" : "txs"}
            </span>
          </div>
          <div className="divide-y divide-[#F4F4F5]">
            {receipt.historyEntries.map((entry, idx) => (
              <div
                key={entry.txid}
                className="flex items-center justify-between gap-2 py-1.5 first:pt-0 last:pb-0"
              >
                <span className="font-semibold text-[#111111]">
                  {entry.role === "settlement"
                    ? "Cashier Settlement"
                    : entry.role === "refund"
                      ? "Table Refund"
                      : `Slice Deposit #${idx + 1}`}
                </span>
                <a
                  href={entry.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[#52525B] underline decoration-[#18181B]/25 underline-offset-2 hover:text-[#111111] hover:decoration-[#18181B]"
                >
                  <span>{truncateMiddle(entry.txid, 8, 6)}</span>
                  <ArrowUpRight className="size-3" aria-hidden="true" />
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <a
          href={receipt.explorerUrl}
          target="_blank"
          rel="noreferrer"
          className="ink-pill-primary inline-flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold"
        >
          <span>View on explorer.bch.ninja</span>
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </a>

        <button
          type="button"
          onClick={onCopyInvitationJson}
          className="ink-pill-secondary inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold"
        >
          <Copy className="size-3.5" aria-hidden="true" />
          <span>Copy Broadcasted XO Invitation JSON</span>
        </button>

        <a
          href={BLAZE_XO_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1 pt-1 font-mono text-[11px] font-semibold text-[#52525B] underline decoration-[#18181B]/30 underline-offset-2 hover:text-[#111111]"
        >
          <span>Inspect signed receipt at blaze.xo.cash</span>
          <ArrowUpRight className="size-3" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
