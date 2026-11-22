"use client";

import { useBillRoom } from "../_hooks/useBillRoom";
import { BillReceiptHeader } from "./BillReceiptHeader";
import { OpenBillPrompt } from "./OpenBillPrompt";
import { ParticipantSlicesCard } from "./ParticipantSlicesCard";
import { PaymentQrDialog } from "./PaymentQrDialog";
import { SettlementConsoleCard } from "./SettlementConsoleCard";
import { ShareBillQrDialog } from "./ShareBillQrDialog";

export function BillRoomView() {
  const room = useBillRoom();

  if (!room.activeBill) {
    return (
      <OpenBillPrompt
        pasteInput={room.pasteInput}
        pasteError={room.pasteError}
        invalidTokenError={room.invalidTokenError}
        onPasteInputChange={room.onPasteInputChange}
        onSubmit={room.onOpenSubmittedBill}
      />
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
      <BillReceiptHeader
        state={room.activeBill}
        onCopyBillLink={room.onCopyBillLink}
        onOpenShareQr={room.onOpenShareQr}
        onCopyPotAddress={room.onCopyPotAddress}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <ParticipantSlicesCard
          participants={room.activeBill.bill.participants}
          onSelectParticipant={room.onSelectParticipant}
        />

        <SettlementConsoleCard
          state={room.activeBill}
          onCopyCashierAddress={room.onCopyCashierAddress}
        />
      </div>

      <PaymentQrDialog
        open={Boolean(room.selectedParticipant)}
        billTitle={room.activeBill.bill.title}
        contractAddress={room.activeBill.contract.contractAddress}
        participant={room.selectedParticipant}
        paymentQr={room.paymentQr}
        isGenerating={room.isGeneratingPaymentQr}
        onClose={room.onClosePaymentQr}
        onCopyUri={room.onCopyPaymentUri}
        onCopyContractAddress={room.onCopyPotAddress}
      />

      <ShareBillQrDialog
        open={room.shareQrOpen}
        billTitle={room.activeBill.bill.title}
        qrDataUrl={room.shareQrDataUrl}
        onClose={room.onCloseShareQr}
        onCopyLink={room.onCopyBillLink}
      />
    </section>
  );
}
