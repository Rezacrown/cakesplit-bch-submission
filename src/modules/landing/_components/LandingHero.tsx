import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { HERO_COPY } from "../constants";
import {
  InkHeadlineUnderline,
  InkMotionArcs,
  InkSparkle,
} from "./InkOrnaments";

export function LandingHero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-12 pb-14 sm:px-6 sm:pt-16 sm:pb-20 lg:pt-20">
      <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[#18181B] bg-[#FFFFFF] px-3.5 py-1.5 text-xs font-bold tracking-wider text-[#18181B] shadow-xs">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-[#18181B]"
            />
            <span>{HERO_COPY.eyebrow}</span>
          </div>

          <div className="space-y-4">
            <h1 className="font-display text-4xl leading-[1.03] font-extrabold tracking-tight text-[#111111] sm:text-5xl lg:text-[3.75rem]">
              {HERO_COPY.headlineTop}
              <span className="mt-1.5 block">
                {HERO_COPY.headlineLead}{" "}
                <span className="relative inline-block whitespace-nowrap">
                  <span>{HERO_COPY.headlineAccent}</span>
                  <InkHeadlineUnderline className="absolute -bottom-2.5 left-0 h-3.5" />
                </span>
              </span>
            </h1>

            <p className="max-w-lg pt-1 text-base leading-relaxed text-[#52525B] sm:text-lg">
              {HERO_COPY.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            <Link
              href="/create"
              className="ink-pill-primary inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold sm:text-base"
            >
              <span>{HERO_COPY.primaryCta}</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>

            <a
              href="#reel"
              className="ink-pill-secondary inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold sm:text-base"
            >
              <Play className="size-4 fill-current" aria-hidden="true" />
              <span>{HERO_COPY.secondaryCta}</span>
            </a>
          </div>

          <ul
            aria-label="Key highlights"
            className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs font-semibold tracking-wide text-[#52525B] sm:text-sm"
          >
            {HERO_COPY.trustPoints.map((point, idx) => (
              <li key={point} className="inline-flex items-center gap-2">
                {idx > 0 && (
                  <span
                    aria-hidden="true"
                    className="hidden size-1 rounded-full bg-[#18181B]/35 sm:inline-block"
                  />
                )}
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto flex w-full max-w-md items-center justify-center py-6 lg:max-w-none">
          <div
            aria-hidden="true"
            className="paper-stipple absolute inset-6 rounded-full border-[1.5px] border-dashed border-[#18181B]/25 bg-[#F4F4F5]/75 sm:inset-8"
          />

          <div
            aria-hidden="true"
            className="absolute inset-11 rounded-full border border-[#18181B]/10 bg-[#FFFFFF]/80 sm:inset-14"
          />

          <div className="animate-motion-twinkle absolute top-6 left-6 sm:left-10">
            <InkSparkle className="size-7" />
          </div>

          <div
            className="animate-motion-twinkle absolute right-8 bottom-12"
            style={{ animationDelay: "900ms" }}
          >
            <InkSparkle className="size-5" />
          </div>

          <div className="absolute bottom-10 left-4 hidden sm:block">
            <InkMotionArcs className="h-14 w-14 opacity-70" />
          </div>

          <div className="absolute top-1 right-2 z-20 sm:top-3 sm:right-4">
            <div className="relative rounded-2xl border-[1.75px] border-[#18181B] bg-[#FFFFFF] px-4 py-2 text-xs font-bold text-[#111111] shadow-[0_8px_20px_rgba(17,17,17,0.08)] sm:text-sm">
              <span>{HERO_COPY.speechBubble}</span>
              <span
                aria-hidden="true"
                className="absolute -bottom-2 left-7 size-3.5 rotate-45 border-r-[1.75px] border-b-[1.75px] border-[#18181B] bg-[#FFFFFF]"
              />
            </div>
          </div>

          <div className="animate-mascot-float relative z-10 flex items-center justify-center">
            <img
              src="/mascots/hero.png"
              alt="CakeSplit vintage cartoon cake mascot holding a Bitcoin Cash receipt"
              width={360}
              height={390}
              className="h-auto w-64 object-contain drop-shadow-[0_14px_22px_rgba(17,17,17,0.1)] sm:w-80 lg:w-[355px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
