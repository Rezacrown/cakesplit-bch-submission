import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { CreateBillView } from "@/modules/create-bill";

export const metadata: Metadata = {
  title: "Create a Table Check — CakeSplit",
  description:
    "Set the bill total, add your friends, and create a shareable Bitcoin Cash split-bill link.",
};

export default function CreateBillPage() {
  return (
    <AppShell>
      <CreateBillView />
    </AppShell>
  );
}
