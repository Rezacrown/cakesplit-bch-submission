import { Check, Lock, Receipt, ShieldCheck } from "lucide-react";
import type { StoryScene } from "../constants";
import { InkSparkle, InkStarburstRays } from "./InkOrnaments";

interface CartoonSceneCanvasProps {
  scene: StoryScene;
}

function SceneCheckDrops({ scene }: CartoonSceneCanvasProps) {
  const slices = [
    { label: "Seat 1", amount: "$16.00" },
    { label: "Seat 2", amount: "$16.00" },
    { label: "Seat 3", amount: "$16.00" },
  ];

  return (
    <div className="flex w-full flex-col items-center justify-center gap-5 sm:flex-row sm:gap-7">
      <div className="animate-mascot-float relative flex shrink-0 items-center justify-center">
        <img
          src={scene.mascotSrc}
          alt={scene.mascotAlt}
          width={176}
          height={145}
          className="h-32 w-auto object-contain sm:h-40"
        />
      </div>

      <div className="w-full max-w-[235px] rounded-2xl border-[1.75px] border-[#18181B] bg-[#FFFFFF] p-4 shadow-[0_8px_20px_rgba(17,17,17,0.06)]">
        <div className="flex items-center justify-between border-b border-dashed border-[#18181B]/30 pb-2.5">
          <div className="flex items-center gap-1.5">
            <Receipt className="size-3.5 text-[#18181B]" aria-hidden="true" />
            <span className="font-mono text-[11px] font-bold tracking-wider text-[#111111]">
              TABLE CHECK
            </span>
          </div>
          <span className="font-mono text-xs font-extrabold text-[#111111]">
            $48.00
          </span>
        </div>

        <div className="mt-3 space-y-2">
          {slices.map((slice, idx) => (
            <div
              key={slice.label}
              className="animate-slice-fan flex items-center justify-between rounded-xl border border-[#18181B]/20 bg-[#FAF9F6] px-3 py-1.5 text-xs font-semibold text-[#111111]"
              style={{ animationDelay: `${idx * 240}ms` }}
            >
              <span>{slice.label}</span>
              <span className="font-mono font-bold">{slice.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SceneEveryoneChipsIn({ scene }: CartoonSceneCanvasProps) {
  const contributors = [
    { seat: "Maya", share: "Slice 1" },
    { seat: "Liam", share: "Slice 2" },
    { seat: "Nora", share: "Slice 3" },
  ];

  return (
    <div className="flex w-full flex-col items-center justify-center gap-5 sm:flex-row sm:gap-7">
      <div className="animate-mascot-float relative flex shrink-0 items-center justify-center">
        <img
          src={scene.mascotSrc}
          alt={scene.mascotAlt}
          width={168}
          height={162}
          className="h-32 w-auto object-contain sm:h-40"
        />
      </div>

      <div className="w-full max-w-[250px] space-y-3.5 rounded-2xl border-[1.75px] border-[#18181B] bg-[#FFFFFF] p-4 shadow-[0_8px_20px_rgba(17,17,17,0.06)]">
        <div className="flex items-center justify-between text-xs font-bold text-[#111111]">
          <span className="font-mono tracking-wider uppercase">Shared Pot</span>
          <span className="rounded-full bg-[#18181B] px-2 py-0.5 font-mono text-[11px] text-[#FAF9F6]">
            3 / 3 Slices
          </span>
        </div>

        <div className="h-3.5 w-full overflow-hidden rounded-full border-[1.5px] border-[#18181B] bg-[#F4F4F5] p-0.5">
          <div className="animate-ink-fill h-full rounded-full bg-[#18181B]" />
        </div>

        <div className="grid grid-cols-3 gap-1.5 pt-0.5">
          {contributors.map((item) => (
            <div
              key={item.seat}
              className="flex flex-col items-center rounded-xl border border-[#E4E4E7] bg-[#FAF9F6] px-2 py-1.5 text-center"
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-[#18181B] text-[#FAF9F6]">
                <Check className="size-3" aria-hidden="true" />
              </span>
              <span className="mt-1 text-[11px] font-bold text-[#111111]">
                {item.seat}
              </span>
              <span className="font-mono text-[10px] text-[#52525B]">
                {item.share}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SceneProtected({ scene }: CartoonSceneCanvasProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-5 sm:flex-row sm:gap-7">
      <div className="animate-mascot-float relative flex shrink-0 items-center justify-center">
        <img
          src={scene.mascotSrc}
          alt={scene.mascotAlt}
          width={148}
          height={148}
          className="h-32 w-auto object-contain sm:h-36"
        />
      </div>

      <div className="animate-stamp-pop relative flex size-44 flex-col items-center justify-center rounded-full border-[2px] border-[#18181B] bg-[#FFFFFF] p-4 text-center shadow-[0_8px_24px_rgba(17,17,17,0.08)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-2 rounded-full border border-dashed border-[#18181B]/45"
        />
        <span className="flex size-10 items-center justify-center rounded-full bg-[#18181B] text-[#FAF9F6]">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <p className="mt-2 font-mono text-[10px] font-bold tracking-widest text-[#52525B] uppercase">
          SHARED POT SEAL
        </p>
        <p className="mt-0.5 font-display text-sm leading-tight font-extrabold text-[#111111]">
          Locked for the Cashier
        </p>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#F4F4F5] px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#18181B]">
          <Lock className="size-2.5" aria-hidden="true" />
          Cancelable before full
        </span>
      </div>
    </div>
  );
}

function SceneSettled({ scene }: CartoonSceneCanvasProps) {
  return (
    <div className="relative flex w-full flex-col items-center justify-center gap-4">
      <div className="relative flex items-center justify-center gap-3 sm:gap-5">
        <div className="animate-motion-twinkle pointer-events-none absolute -top-5 -left-4 opacity-50">
          <InkStarburstRays className="size-14" />
        </div>

        <div className="animate-mascot-hop relative z-10">
          <img
            src={scene.mascotSrc}
            alt={scene.mascotAlt}
            width={156}
            height={166}
            className="h-36 w-auto object-contain sm:h-40"
          />
        </div>

        <div
          className="animate-mascot-float relative z-10 self-start pt-2"
          style={{ animationDelay: "350ms" }}
        >
          <img
            src="/mascots/party.png"
            alt="CakeSplit celebration party sticker"
            width={110}
            height={96}
            className="h-20 w-auto object-contain sm:h-24"
          />
        </div>

        <div
          className="animate-motion-twinkle pointer-events-none absolute -right-3 bottom-2"
          style={{ animationDelay: "550ms" }}
        >
          <InkSparkle className="size-6" />
        </div>
      </div>

      <div className="animate-stamp-pop inline-flex items-center gap-2 rounded-full border-[1.75px] border-[#18181B] bg-[#18181B] px-4 py-1.5 font-mono text-xs font-bold tracking-wider text-[#FAF9F6] uppercase">
        <Check className="size-3.5" aria-hidden="true" />
        <span>Paid in Full / Zero Platform Fees</span>
      </div>
    </div>
  );
}

export function CartoonSceneCanvas({ scene }: CartoonSceneCanvasProps) {
  return (
    <div
      key={scene.id}
      className="animate-scene-enter paper-stipple relative flex min-h-[290px] w-full items-center justify-center overflow-hidden rounded-3xl border-[1.5px] border-[#18181B]/15 bg-[#FAF9F6] p-6 sm:min-h-[320px] sm:p-8"
    >
      <span
        aria-hidden="true"
        className="absolute top-3.5 left-4 font-mono text-[11px] font-bold tracking-widest text-[#71717A]"
      >
        FRAME {scene.frameNumber}
      </span>

      {scene.id === "check" && <SceneCheckDrops scene={scene} />}
      {scene.id === "chip-in" && <SceneEveryoneChipsIn scene={scene} />}
      {scene.id === "protected" && <SceneProtected scene={scene} />}
      {scene.id === "settled" && <SceneSettled scene={scene} />}
    </div>
  );
}
