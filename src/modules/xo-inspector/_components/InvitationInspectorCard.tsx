import {
  AlertCircle,
  Copy,
  Download,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CakeSplitActionId } from "@/lib/xo";
import { XO_ACTION_SPECS } from "../constants";
import {
  truncateIdentifier,
  type InspectedInvitationEntry,
} from "../_utils/xoInspectorHelpers";

interface InvitationInspectorCardProps {
  activeAction: CakeSplitActionId;
  activeInvitation: InspectedInvitationEntry;
  onSelectAction: (action: CakeSplitActionId) => void;
  onCopyEntityId: () => void;
  onCopyInvitationJson: () => void;
  onDownloadInvitationJson: () => void;
}

const VALID_ACTIONS = new Set<string>(XO_ACTION_SPECS.map((s) => s.id));

export function InvitationInspectorCard({
  activeAction,
  activeInvitation,
  onSelectAction,
  onCopyEntityId,
  onCopyInvitationJson,
  onDownloadInvitationJson,
}: InvitationInspectorCardProps) {
  return (
    <div className="ink-card overflow-hidden rounded-3xl">
      <div className="paper-stipple flex flex-wrap items-center justify-between gap-3 border-b-[1.5px] border-[#18181B]/12 bg-[#F4F4F5] px-5 py-4 sm:px-7">
        <div className="flex items-center gap-2.5">
          <KeyRound className="size-4 text-[#111111]" aria-hidden="true" />
          <h2 className="font-display text-base font-extrabold text-[#111111]">
            Signed XO Invitations
          </h2>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-bold ${
            activeInvitation.verified
              ? "border-[#18181B] bg-[#18181B] text-[#FAF9F6]"
              : "border-[#18181B]/30 bg-[#FFFFFF] text-[#111111]"
          }`}
        >
          {activeInvitation.verified ? (
            <ShieldCheck className="size-3.5" aria-hidden="true" />
          ) : (
            <AlertCircle className="size-3.5" aria-hidden="true" />
          )}
          <span>
            {activeInvitation.verified
              ? "Schnorr Verified"
              : "Verification Failed"}
          </span>
        </span>
      </div>

      <div className="space-y-5 p-5 sm:p-7">
        <Tabs
          value={activeAction}
          onValueChange={(value) => {
            if (VALID_ACTIONS.has(value)) {
              onSelectAction(value as CakeSplitActionId);
            }
          }}
        >
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-2xl border border-[#E4E4E7] bg-[#F4F4F5] p-1 sm:grid-cols-4 sm:rounded-full">
            {XO_ACTION_SPECS.map((spec) => (
              <TabsTrigger
                key={spec.id}
                value={spec.id}
                className="rounded-xl py-2 font-mono text-xs font-bold text-[#52525B] data-active:bg-[#18181B] data-active:text-[#FAF9F6] sm:rounded-full"
              >
                {spec.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E4E4E7] bg-[#FAF9F6] p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold tracking-wider text-[#71717A] uppercase">
                Entity Identifier
              </span>
              <button
                type="button"
                onClick={onCopyEntityId}
                className="inline-flex cursor-pointer items-center gap-1 font-mono text-[10px] font-bold text-[#111111] hover:underline"
              >
                <Copy className="size-3" aria-hidden="true" />
                <span>Copy</span>
              </button>
            </div>
            <p className="mt-1 truncate font-mono text-xs font-bold text-[#111111]">
              {truncateIdentifier(activeInvitation.entityIdentifier, 14, 8)}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E4E4E7] bg-[#FAF9F6] p-3.5">
            <span className="font-mono text-[10px] font-bold tracking-wider text-[#71717A] uppercase">
              Invitation ID
            </span>
            <p className="mt-1 truncate font-mono text-xs font-bold text-[#111111]">
              {activeInvitation.invitationIdentifier}
            </p>
          </div>

          <div className="rounded-2xl border border-[#E4E4E7] bg-[#FAF9F6] p-3.5">
            <span className="font-mono text-[10px] font-bold tracking-wider text-[#71717A] uppercase">
              Action Role
            </span>
            <p className="mt-1 font-mono text-xs font-bold text-[#111111] uppercase">
              {activeInvitation.role}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border-[1.5px] border-[#18181B] bg-[#111111]">
          <div className="flex items-center justify-between border-b border-[#27272A] px-4 py-2.5">
            <span className="font-mono text-[11px] font-semibold text-[#A1A1AA]">
              cakesplit-{activeInvitation.actionId}-invitation.json (Extended
              JSON)
            </span>
            <span className="font-mono text-[10px] font-bold text-[#D4D4D8] uppercase">
              @xo-cash/utils
            </span>
          </div>
          <pre className="max-h-96 overflow-auto p-4 font-mono text-xs leading-relaxed text-[#FAF9F6]">
            <code>{activeInvitation.prettyJson}</code>
          </pre>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onCopyInvitationJson}
            className="ink-pill-primary inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold"
          >
            <Copy className="size-3.5" aria-hidden="true" />
            <span>Copy Invitation JSON</span>
          </button>

          <button
            type="button"
            onClick={onDownloadInvitationJson}
            className="ink-pill-secondary inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold"
          >
            <Download className="size-3.5" aria-hidden="true" />
            <span>Download JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
}
