import type { FormEvent } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Link2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { OPEN_PROMPT_COPY } from "../constants";

interface OpenBillPromptProps {
  pasteInput: string;
  pasteError: string | null;
  invalidTokenError: string | null;
  onPasteInputChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function OpenBillPrompt({
  pasteInput,
  pasteError,
  invalidTokenError,
  onPasteInputChange,
  onSubmit,
}: OpenBillPromptProps) {
  const activeError = pasteError ?? invalidTokenError;

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-12 sm:px-6 sm:py-16">
      <div className="ink-card w-full overflow-hidden rounded-3xl">
        <div className="paper-stipple flex flex-col items-center border-b-[1.5px] border-[#18181B]/12 bg-[#F4F4F5] px-6 py-8 text-center sm:px-10">
          <div className="flex size-28 items-center justify-center rounded-full border-[1.5px] border-dashed border-[#18181B]/25 bg-[#FFFFFF] p-3">
            <img
              src="/mascots/thinking.png"
              alt="CakeSplit mascot looking up a table check"
              width={96}
              height={96}
              className="animate-mascot-float h-22 w-auto object-contain"
            />
          </div>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#18181B]/20 bg-[#FFFFFF] px-3.5 py-1 font-mono text-[11px] font-bold tracking-widest text-[#18181B] uppercase">
            <span
              className="size-1.5 rounded-full bg-[#18181B]"
              aria-hidden="true"
            />
            <span>{OPEN_PROMPT_COPY.eyebrow}</span>
          </div>

          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[#111111] sm:text-4xl">
            {OPEN_PROMPT_COPY.title}
          </h1>

          <p className="mt-2 max-w-md text-sm leading-relaxed text-[#52525B] sm:text-base">
            {OPEN_PROMPT_COPY.subtitle}
          </p>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <form onSubmit={onSubmit} className="space-y-3" noValidate>
            <label
              htmlFor="bill-link-input"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider text-[#18181B] uppercase"
            >
              <Link2 className="size-3.5 text-[#52525B]" aria-hidden="true" />
              CakeSplit Link or Token
            </label>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Input
                id="bill-link-input"
                placeholder={OPEN_PROMPT_COPY.placeholder}
                value={pasteInput}
                onChange={(e) => onPasteInputChange(e.target.value)}
                aria-invalid={Boolean(activeError)}
                className="h-11 flex-1 rounded-xl border-[1.5px] border-[#18181B]/20 bg-[#FAF9F6] px-3.5 font-mono text-xs text-[#111111] placeholder:font-sans placeholder:text-[#71717A]/70 focus-visible:border-[#18181B] focus-visible:bg-[#FFFFFF]"
              />
              <button
                type="submit"
                className="ink-pill-primary inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold"
              >
                <span>{OPEN_PROMPT_COPY.openCta}</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>

            {activeError ? (
              <p className="inline-flex items-start gap-2 rounded-xl border border-dashed border-[#18181B]/30 bg-[#F4F4F5] px-3.5 py-2.5 text-xs font-medium text-[#18181B]">
                <AlertCircle
                  className="mt-0.5 size-3.5 shrink-0"
                  aria-hidden="true"
                />
                <span>{activeError}</span>
              </p>
            ) : null}
          </form>

          <div className="receipt-perforation flex flex-col items-center justify-between gap-3 pt-5 sm:flex-row">
            <p className="text-xs font-medium text-[#52525B]">
              Hosting dinner tonight? Spin up a fresh split in seconds.
            </p>
            <Link
              href="/create"
              className="ink-pill-secondary inline-flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-bold sm:text-sm"
            >
              <Plus className="size-4" aria-hidden="true" />
              <span>{OPEN_PROMPT_COPY.createCta}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
