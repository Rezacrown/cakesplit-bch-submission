import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Copy,
  Download,
  FileCode2,
  Layers,
} from "lucide-react";
import { XO_ACTION_SPECS, XO_DEBUG_URL } from "../constants";
import {
  truncateIdentifier,
  type XoInspectorSnapshot,
} from "../_utils/xoInspectorHelpers";

interface TemplateOverviewCardProps {
  snapshot: XoInspectorSnapshot;
  onCopyTemplateId: () => void;
  onCopyTemplateJson: () => void;
  onDownloadTemplateJson: () => void;
  onCopyContractAddress: () => void;
}

export function TemplateOverviewCard({
  snapshot,
  onCopyTemplateId,
  onCopyTemplateJson,
  onDownloadTemplateJson,
  onCopyContractAddress,
}: TemplateOverviewCardProps) {
  const { context } = snapshot;

  return (
    <div className="ink-card overflow-hidden rounded-3xl">
      <div className="paper-stipple flex flex-wrap items-center justify-between gap-3 border-b-[1.5px] border-[#18181B]/12 bg-[#F4F4F5] px-5 py-4 sm:px-7">
        <div className="flex items-center gap-2.5">
          <FileCode2 className="size-4 text-[#111111]" aria-hidden="true" />
          <h2 className="font-display text-base font-extrabold text-[#111111]">
            CakeSplit XO Template
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#18181B]/25 bg-[#FFFFFF] px-3 py-0.5 font-mono text-[11px] font-bold text-[#111111]">
            <span
              className="size-1.5 rounded-full bg-[#18181B]"
              aria-hidden="true"
            />
            {context.contract.network === "mainnet"
              ? "Bitcoin Cash Mainnet"
              : "Chipnet"}
          </span>

          {context.source === "bill" && context.billToken ? (
            <Link
              href={`/bill?d=${encodeURIComponent(context.billToken)}`}
              className="inline-flex items-center gap-1 rounded-full border border-[#18181B]/25 bg-[#FFFFFF] px-3 py-0.5 text-[11px] font-bold text-[#111111] transition-colors hover:bg-[#18181B] hover:text-[#FAF9F6]"
            >
              <ArrowLeft className="size-3" aria-hidden="true" />
              <span>Back to {context.billTitle}</span>
            </Link>
          ) : null}
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-7">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#E4E4E7] bg-[#FAF9F6] p-3.5 sm:col-span-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold tracking-wider text-[#71717A] uppercase">
                Canonical Template ID
              </span>
              <button
                type="button"
                onClick={onCopyTemplateId}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#18181B]/20 bg-[#FFFFFF] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#111111] transition-colors hover:border-[#18181B]"
              >
                <Copy className="size-3" aria-hidden="true" />
                <span>Copy</span>
              </button>
            </div>
            <p className="mt-1.5 truncate font-mono text-xs font-bold text-[#111111]">
              {snapshot.templateId}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E4E4E7] bg-[#FAF9F6] p-3.5">
            <span className="font-mono text-[10px] font-bold tracking-wider text-[#71717A] uppercase">
              Redeem Script Size
            </span>
            <p className="mt-1.5 font-mono text-lg font-extrabold text-[#111111]">
              {snapshot.redeemScriptBytes} bytes
            </p>
          </div>

          <div className="rounded-2xl border border-[#E4E4E7] bg-[#FAF9F6] p-3.5">
            <span className="font-mono text-[10px] font-bold tracking-wider text-[#71717A] uppercase">
              Locking Type
            </span>
            <p className="mt-1.5 font-mono text-lg font-extrabold text-[#111111]">
              {snapshot.lockingType}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-dashed border-[#18181B]/25 bg-[#F4F4F5]/70 px-4 py-3 text-xs">
          <div className="flex min-w-0 items-center gap-2">
            <Layers className="size-3.5 shrink-0 text-[#52525B]" aria-hidden="true" />
            <span className="font-semibold text-[#52525B]">
              Compiled Pot Address:
            </span>
            <span className="truncate font-mono font-bold text-[#111111]">
              {truncateIdentifier(context.contract.contractAddress, 20, 10)}
            </span>
          </div>
          <button
            type="button"
            onClick={onCopyContractAddress}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-[#18181B]/20 bg-[#FFFFFF] px-3 py-1 font-mono text-[11px] font-bold text-[#111111] hover:border-[#18181B]"
          >
            <Copy className="size-3" aria-hidden="true" />
            <span>Copy Address</span>
          </button>
        </div>

        <div className="space-y-3">
          <p className="font-mono text-[11px] font-bold tracking-wider text-[#52525B] uppercase">
            Covenant Actions & Spend Rules
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {XO_ACTION_SPECS.map((spec) => (
              <div
                key={spec.id}
                className="flex flex-col gap-2 rounded-2xl border border-[#E4E4E7] bg-[#FFFFFF] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-sm font-extrabold text-[#111111]">
                    {spec.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full border border-[#18181B]/20 bg-[#F4F4F5] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#111111] uppercase">
                      {spec.role}
                    </span>
                    <span className="font-mono text-[10px] font-semibold text-[#71717A]">
                      {spec.branchTag}
                    </span>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-[#52525B]">
                  {spec.ruleSummary}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="receipt-perforation flex flex-wrap items-center gap-2.5 pt-5">
          <button
            type="button"
            onClick={onCopyTemplateJson}
            className="ink-pill-primary inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold"
          >
            <Copy className="size-3.5" aria-hidden="true" />
            <span>Copy Template JSON</span>
          </button>

          <button
            type="button"
            onClick={onDownloadTemplateJson}
            className="ink-pill-secondary inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold"
          >
            <Download className="size-3.5" aria-hidden="true" />
            <span>Download cakesplit-template.json</span>
          </button>

          <a
            href={XO_DEBUG_URL}
            target="_blank"
            rel="noreferrer"
            className="ink-pill-secondary inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold"
          >
            <span>Open blaze.xo.cash</span>
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
