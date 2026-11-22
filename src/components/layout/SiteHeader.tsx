import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#E4E4E7] bg-[#FAF9F6]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 focus-visible:outline-none"
        >
          <span className="flex size-10 items-center justify-center rounded-2xl border-[1.5px] border-[#18181B] bg-[#FFFFFF] p-1.5 shadow-xs transition-transform duration-200 group-hover:-rotate-6">
            <img
              src="/mascots/logo-mark.png"
              alt="CakeSplit mascot mark"
              width={28}
              height={28}
              className="size-7 object-contain"
            />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-[#111111]">
            CakeSplit
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-2 sm:gap-5"
        >
          <Link
            href="/#reel"
            className="hidden rounded-full px-3 py-1.5 text-sm font-semibold text-[#52525B] transition-colors hover:bg-[#F4F4F5] hover:text-[#111111] md:inline-flex"
          >
            How It Works
          </Link>
          <Link
            href="/#why-cakesplit"
            className="hidden rounded-full px-3 py-1.5 text-sm font-semibold text-[#52525B] transition-colors hover:bg-[#F4F4F5] hover:text-[#111111] md:inline-flex"
          >
            Why CakeSplit
          </Link>
          <Link
            href="/create"
            className="ink-pill-primary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold"
          >
            <span>Start a Split</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
