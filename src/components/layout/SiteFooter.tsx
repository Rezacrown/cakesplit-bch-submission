import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const GITHUB_REPO_URL = "https://github.com/Rezacrown/bch-blaze-hackathon";
const XO_SITE_URL = "https://blaze.xo.cash";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[#E4E4E7] bg-[#FFFFFF]">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 px-4 py-8 sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl border border-[#E4E4E7] bg-[#FAF9F6] p-1">
            <img
              src="/mascots/logo-mark.png"
              alt="CakeSplit"
              width={24}
              height={24}
              className="size-6 object-contain"
            />
          </span>
          <div className="text-sm">
            <span className="font-display font-extrabold text-[#111111]">
              CakeSplit
            </span>
            <span className="mx-2 text-[#D4D4D8]">/</span>
            <span className="text-[#52525B]">
              Group bill splitting on Bitcoin Cash
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-[#52525B]">
          <Link
            href="/#reel"
            className="transition-colors hover:text-[#111111]"
          >
            How It Works
          </Link>
          <Link
            href="/#why-cakesplit"
            className="transition-colors hover:text-[#111111]"
          >
            Why CakeSplit
          </Link>
          <Link
            href="/create"
            className="transition-colors hover:text-[#111111]"
          >
            Start a Split
          </Link>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-[#111111]"
          >
            <span>GitHub</span>
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
          <a
            href={XO_SITE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-[#111111]"
          >
            <span>blaze.xo.cash</span>
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
