import { Suspense } from "react";
import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { XoInspectorSkeleton, XoInspectorView } from "@/modules/xo-inspector";

export const metadata: Metadata = {
  title: "XO Contract Inspector — CakeSplit",
  description:
    "Verify the CakeSplit XO template, inspect Schnorr-signed invitations, and open them directly in blaze.xo.cash.",
};

export default function XoInspectorPage() {
  return (
    <AppShell>
      <Suspense fallback={<XoInspectorSkeleton />}>
        <XoInspectorView />
      </Suspense>
    </AppShell>
  );
}
