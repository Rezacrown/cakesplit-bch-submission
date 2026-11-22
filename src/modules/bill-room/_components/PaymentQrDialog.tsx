import { Copy, QrCode, Smartphone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { COMPATIBLE_WALLETS } from "../constants";
import type { ActivePaymentQr, BillParticipant } from "../_hooks/useBillRoom";
import {
  formatBchAmount,
  formatSatsCount,
  formatUsdApprox,
  truncateMiddle,
} from "../_utils/billRoomHelpers";

interface PaymentQrDialogProps {
  open: boolean;
  billTitle: string;
  contractAddress: string;
  participant: BillParticipant | null;
  paymentQr: ActivePaymentQr | null;
  isGenerating: boolean;
  onClose: () => void;
  onCopyUri: () => void;
  onCopyContractAddress: () => void;
}

export function PaymentQrDialog({
  open,
  billTitle,
  contractAddress,
  participant,
  paymentQr,
  isGenerating,
  onClose,
  onCopyUri,
  onCopyContractAddress,
}: PaymentQrDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="rounded-3xl border-[1.75px] border-[#18181B] bg-[#FFFFFF] p-6 shadow-[0_18px_40px_rgba(17,17,17,0.16)] sm:max-w-md">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#18181B]/20 bg-[#F4F4F5] px-3 py-0.5 font-mono text-[11px] font-bold text-[#111111] uppercase">
            <QrCode className="size-3" aria-hidden="true" />
            <span>BIP21 Payment QR</span>
          </div>
          <DialogTitle className="font-display text-xl font-extrabold text-[#111111]">
            {participant ? `Pay ${participant.label}'s Slice` : "Pay Slice"}
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-[#52525B]">
            Scan with any Bitcoin Cash wallet to chip into{" "}
            <strong className="font-semibold text-[#111111]">{billTitle}</strong>
            .
          </DialogDescription>
        </DialogHeader>

        {participant ? (
          <div className="space-y-4 pt-1">
            <div className="flex flex-col items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-[#18181B]/25 bg-[#FAF9F6] p-5">
              {isGenerating || !paymentQr ? (
                <div className="flex size-56 items-center justify-center rounded-2xl border border-[#E4E4E7] bg-[#FFFFFF] font-mono text-xs text-[#71717A]">
                  Generating QR...
                </div>
              ) : (
                <div className="rounded-2xl border-[1.5px] border-[#18181B] bg-[#FFFFFF] p-3 shadow-xs">
                  <img
                    src={paymentQr.dataUrl}
                    alt={`Bitcoin Cash BIP21 QR code for ${participant.label}`}
                    width={220}
                    height={220}
                    className="size-52 object-contain"
                  />
                </div>
              )}

              <div className="text-center">
                <p className="font-mono text-lg font-extrabold text-[#111111]">
                  {formatBchAmount(participant.shareSatoshis)} BCH
                </p>
                <p className="font-mono text-xs text-[#71717A]">
                  {formatSatsCount(participant.shareSatoshis)} sats (
                  {formatUsdApprox(participant.shareSatoshis)})
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 rounded-xl border border-[#E4E4E7] bg-[#F4F4F5] px-3 py-2">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] font-bold tracking-wider text-[#71717A] uppercase">
                    BIP21 Payment URI
                  </p>
                  <p className="truncate font-mono text-xs font-medium text-[#111111]">
                    {paymentQr ? truncateMiddle(paymentQr.uri, 24, 10) : "..."}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!paymentQr}
                  onClick={onCopyUri}
                  className="ink-pill-secondary inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold disabled:opacity-45"
                >
                  <Copy className="size-3" aria-hidden="true" />
                  <span>Copy URI</span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-xl border border-[#E4E4E7] bg-[#F4F4F5] px-3 py-2">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] font-bold tracking-wider text-[#71717A] uppercase">
                    Shared Pot Address
                  </p>
                  <p className="truncate font-mono text-xs font-medium text-[#111111]">
                    {truncateMiddle(contractAddress, 22, 8)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onCopyContractAddress}
                  className="ink-pill-secondary inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold"
                >
                  <Copy className="size-3" aria-hidden="true" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1 text-[11px] font-medium text-[#71717A]">
              <Smartphone className="size-3.5 shrink-0" aria-hidden="true" />
              <span>
                Compatible with {COMPATIBLE_WALLETS.join(", ")}
              </span>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
