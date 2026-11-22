"use client";

import { useCreateBillForm } from "../_hooks/useCreateBillForm";
import { HeroSection } from "./HeroSection";
import { HowItWorksStrip } from "./HowItWorksStrip";
import { SplitBillReceiptCard } from "./SplitBillReceiptCard";

export function CreateBillView() {
  const form = useCreateBillForm();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-8 sm:px-6 lg:py-12">
      <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <HeroSection />
        <SplitBillReceiptCard {...form} />
      </div>

      <HowItWorksStrip />
    </div>
  );
}
