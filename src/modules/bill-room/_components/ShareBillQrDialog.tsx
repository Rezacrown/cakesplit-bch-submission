import { Camera, Copy, Link2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShareBillQrDialogProps {
  open: boolean;
  billTitle: string;
  qrDataUrl: string | null;
  onClose: () => void;
  onCopyLink: () => void;
}

export function ShareBillQrDialog({
  open,
  billTitle,
  qrDataUrl,
  onClose,
  onCopyLink,
}: ShareBillQrDialogProps) {
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
            <Link2 className="size-3" aria-hidden="true" />
            <span>Share Table Check</span>
          </div>
          <DialogTitle className="font-display text-xl font-extrabold text-[#111111]">
            {billTitle}
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-[#52525B]">
            Point any phone camera at this QR code to open this exact CakeSplit
            table check in the browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-[1.5px] border-dashed border-[#18181B]/25 bg-[#FAF9F6] p-5">
            {qrDataUrl ? (
              <div className="rounded-2xl border-[1.5px] border-[#18181B] bg-[#FFFFFF] p-3.5 shadow-xs">
                <img
                  src={qrDataUrl}
                  alt={`Shareable QR link for ${billTitle}`}
                  width={260}
                  height={260}
                  className="size-64 object-contain"
                />
              </div>
            ) : (
              <div className="flex size-64 items-center justify-center rounded-2xl border border-[#E4E4E7] bg-[#FFFFFF] font-mono text-xs text-[#71717A]">
                Generating QR...
              </div>
            )}

            <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#52525B]">
              <Camera className="size-3.5 text-[#111111]" aria-hidden="true" />
              <span>Opens the live table check webpage in any browser</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onCopyLink}
            className="ink-pill-primary inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full px-5 py-3 text-sm font-bold"
          >
            <Copy className="size-4" aria-hidden="true" />
            <span>Copy Bill Link</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
