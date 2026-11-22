"use client";

import { XO_HEADER_COPY } from "../constants";
import { useXoInspector } from "../_hooks/useXoInspector";
import { InvitationInspectorCard } from "./InvitationInspectorCard";
import { TemplateOverviewCard } from "./TemplateOverviewCard";
import { XoInspectorSkeleton } from "./XoInspectorSkeleton";

export function XoInspectorView() {
  const inspector = useXoInspector();

  if (!inspector.snapshot || !inspector.activeInvitation) {
    return <XoInspectorSkeleton />;
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <header className="mx-auto flex max-w-2xl flex-col items-center space-y-5 text-center">
        <div className="paper-stipple flex size-28 items-center justify-center rounded-full border-[1.5px] border-dashed border-[#18181B]/25 bg-[#F4F4F5]/90 p-3 sm:size-32">
          <img
            src="/mascots/cool.png"
            alt="CakeSplit mascot wearing sunglasses inspecting an XO contract"
            width={104}
            height={104}
            className="animate-mascot-float h-22 w-auto object-contain sm:h-24"
          />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#18181B]/20 bg-[#FFFFFF] px-3.5 py-1 font-mono text-[11px] font-bold tracking-widest text-[#18181B] uppercase">
            <span
              className="size-1.5 rounded-full bg-[#18181B]"
              aria-hidden="true"
            />
            <span>{XO_HEADER_COPY.eyebrow}</span>
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#111111] sm:text-5xl">
            {XO_HEADER_COPY.title}
          </h1>

          <p className="mx-auto max-w-xl text-sm leading-relaxed text-[#52525B] sm:text-base">
            {XO_HEADER_COPY.subtitle}
          </p>
        </div>
      </header>

      <TemplateOverviewCard
        snapshot={inspector.snapshot}
        onCopyTemplateId={inspector.onCopyTemplateId}
        onCopyTemplateJson={inspector.onCopyTemplateJson}
        onDownloadTemplateJson={inspector.onDownloadTemplateJson}
        onCopyContractAddress={inspector.onCopyContractAddress}
      />

      <InvitationInspectorCard
        activeAction={inspector.activeAction}
        activeInvitation={inspector.activeInvitation}
        onSelectAction={inspector.onSelectAction}
        onCopyEntityId={inspector.onCopyEntityId}
        onCopyInvitationJson={inspector.onCopyInvitationJson}
        onDownloadInvitationJson={inspector.onDownloadInvitationJson}
      />
    </section>
  );
}
