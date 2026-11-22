import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CLOSING_CTA_COPY } from "../constants";
import { InkSparkle } from "./InkOrnaments";

export function ClosingStampCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-8 pb-6 sm:px-6 sm:pt-12">
      <div className="ink-card relative overflow-hidden rounded-[2rem] p-3 sm:p-4">
        <div className="paper-stipple relative flex flex-col items-center justify-between gap-8 rounded-[1.5rem] border-[1.5px] border-dashed border-[#18181B]/30 bg-[#FAF9F6] px-6 py-10 text-center sm:px-10 sm:py-12 lg:flex-row lg:text-left">
          <div className="relative flex items-center justify-center gap-3">
            <div className="animate-motion-twinkle pointer-events-none absolute -top-3 -left-3">
              <InkSparkle className="size-5" />
            </div>

            <div className="animate-mascot-hop">
              <img
                src="/mascots/happy.png"
                alt="CakeSplit mascot celebrating a completed table split"
                width={150}
                height={160}
                className="h-32 w-auto object-contain sm:h-36"
              />
            </div>

            <div className="animate-mascot-float -ml-3 self-start">
              <img
                src="/mascots/party.png"
                alt="CakeSplit party hat celebration sticker"
                width={90}
                height={78}
                className="h-16 w-auto object-contain sm:h-20"
              />
            </div>
          </div>

          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#18181B]/25 bg-[#FFFFFF] px-3.5 py-1 font-mono text-[11px] font-bold tracking-widest text-[#18181B] uppercase">
              <span>{CLOSING_CTA_COPY.stampTop}</span>
              <span aria-hidden="true" className="text-[#A1A1AA]">
                /
              </span>
              <span className="text-[#52525B]">
                {CLOSING_CTA_COPY.stampBottom}
              </span>
            </div>

            <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#111111] sm:text-4xl">
              {CLOSING_CTA_COPY.headline}
            </h2>

            <p className="text-base leading-relaxed text-[#52525B]">
              {CLOSING_CTA_COPY.description}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-2">
            <Link
              href="/create"
              className="ink-pill-primary inline-flex items-center gap-2 rounded-full px-7 py-4 text-base font-bold"
            >
              <span>{CLOSING_CTA_COPY.ctaLabel}</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <span className="font-mono text-[11px] font-semibold text-[#71717A]">
              NO ACCOUNT REQUIRED
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
