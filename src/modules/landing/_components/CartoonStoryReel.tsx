"use client";

import { Pause, Play } from "lucide-react";
import { STORY_SCENES } from "../constants";
import { useStoryReel } from "../_hooks/useStoryReel";
import { CartoonSceneCanvas } from "./CartoonSceneCanvas";

const SPROCKET_SLOTS = [0, 1, 2, 3, 4, 5];

export function CartoonStoryReel() {
  const {
    activeIndex,
    activeScene,
    isPaused,
    isHovering,
    walkFrameSrc,
    selectScene,
    togglePaused,
    handleMouseEnter,
    handleMouseLeave,
  } = useStoryReel();

  return (
    <section
      id="reel"
      className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20"
    >
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <p className="font-mono text-xs font-bold tracking-widest text-[#52525B] uppercase">
            HOW IT WORKS
          </p>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#111111] sm:text-4xl">
            From dinner check to paid in four frames
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-[#52525B]">
          Watch how CakeSplit guides a group table from splitting the check to
          settling straight with the cashier.
        </p>
      </div>

      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="ink-card overflow-hidden rounded-[2rem]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-[1.5px] border-[#18181B]/15 bg-[#F4F4F5] px-5 py-3 sm:px-7">
          <div className="flex items-center gap-3">
            <div aria-hidden="true" className="hidden items-center gap-1.5 sm:flex">
              {SPROCKET_SLOTS.map((slot) => (
                <span
                  key={slot}
                  className="h-2 w-3 rounded-[3px] border border-[#18181B]/30 bg-[#FFFFFF]"
                />
              ))}
            </div>
            <span className="font-mono text-xs font-bold tracking-widest text-[#111111]">
              REEL {activeScene.frameNumber} / 04
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[11px] font-medium text-[#71717A] sm:inline">
              {isPaused
                ? "Reel paused"
                : isHovering
                  ? "Paused while viewing"
                  : "Auto-playing story"}
            </span>
            <button
              type="button"
              onClick={togglePaused}
              aria-label={isPaused ? "Play story reel" : "Pause story reel"}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#18181B]/25 bg-[#FFFFFF] px-3 py-1 font-mono text-[11px] font-bold text-[#111111] transition-colors hover:border-[#18181B] hover:bg-[#FAF9F6]"
            >
              {isPaused ? (
                <>
                  <Play className="size-3 fill-current" aria-hidden="true" />
                  <span>Play</span>
                </>
              ) : (
                <>
                  <Pause className="size-3" aria-hidden="true" />
                  <span>Pause</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid items-center gap-8 p-5 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          <CartoonSceneCanvas scene={activeScene} />

          <div key={activeScene.id} className="animate-scene-enter space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E4E4E7] bg-[#F4F4F5] px-3 py-1 font-mono text-[11px] font-bold tracking-wider text-[#52525B]">
              <span>{activeScene.kicker}</span>
            </div>

            <div className="space-y-3">
              <h3 className="font-display text-2xl font-extrabold tracking-tight text-[#111111] sm:text-3xl">
                {activeScene.title}
              </h3>
              <p className="text-base leading-relaxed text-[#52525B]">
                {activeScene.description}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl border-[1.5px] border-[#18181B] bg-[#FAF9F6] px-4 py-2.5 text-xs font-bold text-[#111111] sm:text-sm">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full bg-[#18181B]"
              />
              <span>{activeScene.callout}</span>
            </div>
          </div>
        </div>

        <div className="border-t-[1.5px] border-[#18181B]/12 bg-[#FAF9F6] px-5 pt-14 pb-5 sm:px-8 sm:pt-16 sm:pb-6">
          <div className="relative mx-auto mb-6 max-w-4xl">
            <div
              className="pointer-events-none absolute bottom-1 z-10 -translate-x-1/2 transition-[left] duration-700 ease-out"
              style={{ left: `${activeScene.walkPositionPercent}%` }}
            >
              <img
                src={walkFrameSrc}
                alt="CakeSplit mascot walking along the story progress bar"
                width={52}
                height={64}
                className="h-14 w-auto object-contain"
              />
            </div>

            <div className="relative h-2 w-full overflow-hidden rounded-full border border-[#18181B]/25 bg-[#FFFFFF]">
              <div
                className="h-full rounded-full bg-[#18181B] transition-[width] duration-700 ease-out"
                style={{ width: `${activeScene.walkPositionPercent}%` }}
              />
            </div>

            <div
              aria-hidden="true"
              className="mt-1.5 grid grid-cols-4 text-center font-mono text-[10px] font-bold text-[#71717A]"
            >
              {STORY_SCENES.map((scene, idx) => (
                <span
                  key={scene.id}
                  className={idx <= activeIndex ? "text-[#111111]" : undefined}
                >
                  {scene.frameNumber}
                </span>
              ))}
            </div>
          </div>

          <div
            role="tablist"
            aria-label="Story reel scenes"
            className="grid grid-cols-2 gap-2.5 sm:grid-cols-4"
          >
            {STORY_SCENES.map((scene, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={scene.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => selectScene(idx)}
                  className={`flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] px-3.5 py-2 text-left text-xs font-bold transition-all sm:text-sm ${
                    isActive
                      ? "border-[#18181B] bg-[#18181B] text-[#FAF9F6] shadow-xs"
                      : "border-[#E4E4E7] bg-[#FFFFFF] text-[#52525B] hover:border-[#18181B]/50 hover:text-[#111111]"
                  }`}
                >
                  <span
                    className={`font-mono text-[11px] font-extrabold ${
                      isActive ? "text-[#D4D4D8]" : "text-[#71717A]"
                    }`}
                  >
                    {scene.frameNumber}
                  </span>
                  <span className="truncate">{scene.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
