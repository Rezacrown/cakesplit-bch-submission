"use client";

import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidCashAddress, type BchNetwork } from "@/lib/bch";
import {
  formatBchAmount,
  formatSatsCount,
  formatUsdApprox,
} from "../_utils/billRoomHelpers";

interface CancelBillDialogProps {
  open: boolean;
  billTitle: string;
  network: BchNetwork;
  defaultRefundAddress: string;
  collectedSatoshis: bigint;
  priceUsd: number;
  isCancelling: boolean;
  onClose: () => void;
  onConfirm: (refundAddress: string) => Promise<void>;
}

export function CancelBillDialog({
  open,
  billTitle,
  network,
  defaultRefundAddress,
  collectedSatoshis,
  priceUsd,
  isCancelling,
  onClose,
  onConfirm,
}: CancelBillDialogProps) {
  const [refundAddress, setRefundAddress] = useState(defaultRefundAddress);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setRefundAddress(defaultRefundAddress);
    }
  }

  const trimmed = refundAddress.trim();
  const isValid = isValidCashAddress(trimmed, network);
  const expectedPrefix = network === "mainnet" ? "bitcoincash:" : "bchtest:";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || isCancelling) return;
    void onConfirm(trimmed);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isCancelling) onClose();
      }}
    >
      <DialogContent className="rounded-3xl border-[1.75px] border-[#18181B] bg-[#FFFFFF] p-6 shadow-[0_18px_40px_rgba(17,17,17,0.16)] sm:max-w-md">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#18181B]/20 bg-[#F4F4F5] px-3 py-0.5 font-mono text-[11px] font-bold text-[#111111] uppercase">
            <RotateCcw className="size-3" aria-hidden="true" />
            <span>Organizer Refund</span>
          </div>
          <DialogTitle className="font-display text-xl font-extrabold text-[#111111]">
            Cancel &amp; Refund Table
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-[#52525B]">
            Sign and broadcast a `cancelBill` refund sweeping the partial pot
            for{" "}
            <strong className="font-semibold text-[#111111]">{billTitle}</strong>{" "}
            back to your Bitcoin Cash wallet.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="rounded-2xl border border-[#E4E4E7] bg-[#FAF9F6] p-3.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-[#52525B]">
                Current pot to sweep
              </span>
              <span className="font-mono font-bold text-[#111111]">
                {formatBchAmount(collectedSatoshis)} BCH
              </span>
            </div>
            <p className="mt-1 text-right font-mono text-[11px] text-[#71717A]">
              {formatSatsCount(collectedSatoshis)} sats (
              {formatUsdApprox(collectedSatoshis, priceUsd)}) minus network miner
              fee
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label
                htmlFor="refund-cash-address"
                className="font-mono text-[11px] font-bold tracking-wider text-[#18181B] uppercase"
              >
                Refund CashAddress
              </Label>
              {isValid ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#18181B]/20 bg-[#F4F4F5] px-2 py-0.5 font-mono text-[10px] font-bold text-[#111111]">
                  <CheckCircle2 className="size-3" aria-hidden="true" />
                  Valid
                </span>
              ) : null}
            </div>
            <Input
              id="refund-cash-address"
              value={refundAddress}
              onChange={(e) => setRefundAddress(e.target.value)}
              placeholder={`${expectedPrefix}q...`}
              disabled={isCancelling}
              aria-invalid={trimmed.length > 0 && !isValid}
              className="h-11 rounded-xl border-[1.5px] border-[#18181B]/20 bg-[#FAF9F6] px-3.5 font-mono text-xs font-medium text-[#111111] focus-visible:border-[#18181B] focus-visible:bg-[#FFFFFF]"
            />
            {trimmed.length > 0 && !isValid ? (
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#18181B]">
                <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                <span>
                  Enter a valid {network === "mainnet" ? "Mainnet" : "Chipnet"}{" "}
                  address starting with {expectedPrefix}
                </span>
              </p>
            ) : (
              <p className="text-[11px] text-[#71717A]">
                Pre-filled with the cashier address; edit to any wallet you
                control.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isCancelling}
              onClick={onClose}
              className="ink-pill-secondary cursor-pointer rounded-full px-4 py-2.5 text-xs font-bold disabled:opacity-45"
            >
              Keep Pot Open
            </button>
            <button
              type="submit"
              disabled={!isValid || isCancelling}
              className="ink-pill-primary inline-flex cursor-pointer items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                  <span>Broadcasting Refund...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="size-3.5" aria-hidden="true" />
                  <span>Confirm Refund Broadcast</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
