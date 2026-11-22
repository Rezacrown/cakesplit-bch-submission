import { CheckCircle2, QrCode, Users } from "lucide-react";
import type { BillParticipant } from "../_hooks/useBillRoom";
import {
  formatBchAmount,
  formatSatsCount,
  formatUsdApprox,
} from "../_utils/billRoomHelpers";

interface ParticipantSlicesCardProps {
  participants: BillParticipant[];
  paidParticipantIds: ReadonlySet<string>;
  priceUsd: number;
  onSelectParticipant: (participant: BillParticipant) => void;
}

export function ParticipantSlicesCard({
  participants,
  paidParticipantIds,
  priceUsd,
  onSelectParticipant,
}: ParticipantSlicesCardProps) {
  const paidCount = participants.filter((p) =>
    paidParticipantIds.has(p.id),
  ).length;

  return (
    <div className="ink-card flex flex-col overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between border-b-[1.5px] border-[#18181B]/12 bg-[#F4F4F5] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-[#111111]" aria-hidden="true" />
          <h2 className="font-display text-base font-extrabold text-[#111111]">
            Dining Slices
          </h2>
        </div>
        <span className="rounded-full border border-[#18181B]/20 bg-[#FFFFFF] px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#111111]">
          {paidCount > 0
            ? `${paidCount} / ${participants.length} paid`
            : `${participants.length} seats`}
        </span>
      </div>

      <div className="divide-y divide-[#E4E4E7] p-5 sm:p-6">
        {participants.map((person, index) => {
          const isPaid = paidParticipantIds.has(person.id);

          return (
            <div
              key={person.id}
              className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden="true"
                  className={`flex size-8 shrink-0 items-center justify-center rounded-xl border font-mono text-xs font-bold ${
                    isPaid
                      ? "border-[#18181B] bg-[#18181B] text-[#FAF9F6]"
                      : "border-[#18181B]/20 bg-[#FAF9F6] text-[#111111]"
                  }`}
                >
                  {isPaid ? (
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>

                <div className="min-w-0">
                  <p
                    className={`truncate font-display text-sm font-bold ${
                      isPaid ? "text-[#71717A] line-through" : "text-[#111111]"
                    }`}
                  >
                    {person.label}
                  </p>
                  <p
                    className={`font-mono text-xs font-semibold ${
                      isPaid ? "text-[#71717A]" : "text-[#111111]"
                    }`}
                  >
                    {formatBchAmount(person.payableSatoshis)} BCH{" "}
                    <span className="font-normal text-[#71717A]">
                      ({formatSatsCount(person.payableSatoshis)} sats /{" "}
                      {formatUsdApprox(person.payableSatoshis, priceUsd)})
                    </span>
                  </p>
                  {person.feeShareSatoshis > 0 ? (
                    <p className="font-mono text-[10px] text-[#71717A]">
                      {formatSatsCount(person.subtotalSatoshis)} sats bill +{" "}
                      {formatSatsCount(person.feeShareSatoshis)} sats network fee
                    </p>
                  ) : null}
                </div>
              </div>

              {isPaid ? (
                <button
                  type="button"
                  disabled
                  aria-label={`${person.label} slice already paid`}
                  className="inline-flex shrink-0 cursor-not-allowed items-center gap-1.5 rounded-full border border-[#18181B]/20 bg-[#F4F4F5] px-3.5 py-2 text-xs font-bold text-[#71717A]"
                >
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  <span>Paid</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelectParticipant(person)}
                  className="ink-pill-secondary inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold"
                >
                  <QrCode className="size-3.5" aria-hidden="true" />
                  <span>Pay Slice</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
