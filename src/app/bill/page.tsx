import { Suspense } from "react";
import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { BillRoomSkeleton, BillRoomView } from "@/modules/bill-room";

export const metadata: Metadata = {
  title: "Table Check — CakeSplit",
  description:
    "View your shared Bitcoin Cash table pot, scan BIP21 QR codes for each diner's slice, and settle straight to the cashier.",
};

export default function BillRoomPage() {
  return (
    <AppShell>
      <Suspense fallback={<BillRoomSkeleton />}>
        <BillRoomView />
      </Suspense>
    </AppShell>
  );
}
