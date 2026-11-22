import { ArrowUpRight, CheckCircle2, Clock, Coins } from "lucide-react";
import {
  getExplorerTxUrl,
  type BchNetwork,
  type OnChainUtxo,
} from "@/lib/bch";
import {
  formatBchAmount,
  formatSatsCount,
  formatUsdApprox,
  truncateMiddle,
} from "../_utils/billRoomHelpers";

interface IncomingDepositsListProps {
  utxos: OnChainUtxo[];
  network: BchNetwork;
  priceUsd: number;
  isInitialLoading: boolean;
}

export function IncomingDepositsList({
  utxos,
  network,
  priceUsd,
  isInitialLoading,
}: IncomingDepositsListProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider text-[#18181B] uppercase">
          <Coins className="size-3.5 text-[#52525B]" aria-hidden="true" />
          Live Incoming Deposits
        </span>
        <span className="font-mono text-[11px] font-semibold text-[#71717A]">
          {utxos.length} {utxos.length === 1 ? "UTXO" : "UTXOs"}
        </span>
      </div>

      {utxos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#18181B]/25 bg-[#FAF9F6] px-4 py-3.5 text-center">
          <p className="font-mono text-xs font-semibold text-[#52525B]">
            {isInitialLoading
              ? "Checking Bitcoin Cash Fulcrum nodes..."
              : "Listening for incoming Mainnet deposits every 4s"}
          </p>
          <p className="mt-0.5 text-[11px] text-[#71717A]">
            0-conf mempool payments appear automatically as friends scan.
          </p>
        </div>
      ) : (
        <ul className="max-h-48 space-y-2 overflow-y-auto pr-0.5">
          {utxos.map((utxo) => {
            const txUrl = getExplorerTxUrl(utxo.txid, network);
            return (
              <li
                key={`${utxo.txid}:${utxo.vout}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[#E4E4E7] bg-[#FFFFFF] px-3.5 py-2.5 text-xs"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono font-bold text-[#111111]">
                      {formatSatsCount(utxo.satoshis)} sats
                    </span>
                    <span className="font-mono text-[11px] text-[#71717A]">
                      ({formatBchAmount(utxo.satoshis)} BCH /{" "}
                      {formatUsdApprox(utxo.satoshis, priceUsd)})
                    </span>
                  </div>
                  <a
                    href={txUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-[#52525B] underline decoration-[#18181B]/30 underline-offset-2 hover:text-[#111111]"
                  >
                    <span>
                      {truncateMiddle(utxo.txid, 10, 8)}:{utxo.vout}
                    </span>
                    <ArrowUpRight className="size-3" aria-hidden="true" />
                  </a>
                </div>

                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold ${
                    utxo.isUnconfirmed
                      ? "border-[#18181B]/25 bg-[#F4F4F5] text-[#111111]"
                      : "border-[#18181B] bg-[#18181B] text-[#FAF9F6]"
                  }`}
                >
                  {utxo.isUnconfirmed ? (
                    <Clock className="size-2.5" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="size-2.5" aria-hidden="true" />
                  )}
                  <span>{utxo.isUnconfirmed ? "0-conf" : "Confirmed"}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
