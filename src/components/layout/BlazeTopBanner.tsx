"use client";

import { useState } from "react";
import { Check, Code2, Copy, Presentation, Ticket } from "lucide-react";
import { toast } from "sonner";

const EMBER_ADDRESS = "bitcoincash:zr4jg99w7eeupyd9hch370t3ffkd8kmmfs9y4g5aqe";
const EMBER_DISPLAY = "bitcoincash:zr4jg9...g5aqe";
const GITHUB_REPO_URL = "https://github.com/Rezacrown/bch-blaze-hackathon";

export function BlazeTopBanner() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmber = async () => {
    try {
      await navigator.clipboard.writeText(EMBER_ADDRESS);
      setCopied(true);
      toast.success("Copied EMBER2026 CashAddress to clipboard");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy address — please copy manually");
    }
  };

  return (
    <div className="border-b border-[#27272A] bg-[#18181B] text-[#FAF9F6]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 text-xs font-medium sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FAF9F6]/25 bg-[#27272A] px-2.5 py-0.5 font-mono text-[11px] font-semibold tracking-wide text-[#FAF9F6]">
            <Ticket className="size-3" aria-hidden="true" />
            BCH BLAZE 2026
          </span>
          <span className="hidden text-[#A1A1AA] sm:inline">
            Mainnet Track
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3.5">
          <a
            href="#reel"
            title="CakeSplit Story Reel"
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[#D4D4D8] transition-colors hover:text-[#FAF9F6]"
          >
            <Presentation className="size-3.5" aria-hidden="true" />
            <span>Story Reel</span>
          </a>

          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[#D4D4D8] transition-colors hover:text-[#FAF9F6]"
          >
            <Code2 className="size-3.5" aria-hidden="true" />
            <span>GitHub</span>
          </a>

          <button
            type="button"
            onClick={handleCopyEmber}
            title={`Copy EMBER2026 address: ${EMBER_ADDRESS}`}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#FAF9F6]/25 bg-[#27272A] px-2.5 py-0.5 font-mono text-[11px] font-medium text-[#FAF9F6] transition-colors hover:border-[#FAF9F6]/50 hover:bg-[#3F3F46]"
          >
            <span className="font-sans font-bold tracking-wide text-[#FAF9F6]">
              EMBER2026
            </span>
            <span className="hidden text-[#D4D4D8] sm:inline">
              {EMBER_DISPLAY}
            </span>
            {copied ? (
              <Check className="size-3 text-[#FAF9F6]" aria-hidden="true" />
            ) : (
              <Copy className="size-3 text-[#A1A1AA]" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
