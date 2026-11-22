"use client";

import { Lock, ShieldCheck, Wallet } from "lucide-react";
import { CREATE_PAGE_COPY, TRUST_GUARANTEES } from "../constants";
import { useCreateBillForm } from "../_hooks/useCreateBillForm";
import { SplitBillReceiptCard } from "./SplitBillReceiptCard";

const GUARANTEE_ICONS = {
  pot: Wallet,
  settle: ShieldCheck,
  cancel: Lock,
} as const;

export function CreateBillView() {
  const form = useCreateBillForm();

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14">
      <header className="mx-auto flex max-w-2xl flex-col items-center space-y-5 text-center">
        <div className="paper-stipple flex size-28 items-center justify-center rounded-full border-[1.5px] border-dashed border-[#18181B]/25 bg-[#F4F4F5]/90 p-3 sm:size-32">
          <img
            src="/mascots/step-split.png"
            alt="CakeSplit mascot holding a split bill receipt"
            width={108}
            height={108}
            className="animate-mascot-float h-22 w-auto object-contain sm:h-24"
          />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#18181B]/20 bg-[#FFFFFF] px-3.5 py-1 font-mono text-[11px] font-bold tracking-widest text-[#18181B] uppercase">
            <span
              className="size-1.5 rounded-full bg-[#18181B]"
              aria-hidden="true"
            />
            <span>{CREATE_PAGE_COPY.eyebrow}</span>
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#111111] sm:text-5xl">
            {CREATE_PAGE_COPY.title}
          </h1>

          <p className="mx-auto max-w-xl text-sm leading-relaxed text-[#52525B] sm:text-base">
            {CREATE_PAGE_COPY.subtitle}
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-xl">
        <SplitBillReceiptCard {...form} />
      </div>

      <div className="mx-auto grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {TRUST_GUARANTEES.map((item) => {
          const Icon = GUARANTEE_ICONS[item.id];
          return (
            <div
              key={item.id}
              className="ink-card-soft flex flex-col gap-2 rounded-2xl p-4"
            >
              <span className="flex size-8 items-center justify-center rounded-xl border border-[#18181B]/15 bg-[#FFFFFF] text-[#111111]">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <h2 className="font-display text-sm font-extrabold text-[#111111]">
                {item.title}
              </h2>
              <p className="text-xs leading-relaxed text-[#52525B]">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
