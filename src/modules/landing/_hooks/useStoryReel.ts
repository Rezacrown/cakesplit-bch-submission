"use client";

import { useCallback, useEffect, useState } from "react";
import {
  STORY_REEL_INTERVAL_MS,
  STORY_SCENES,
  WALK_CYCLE_INTERVAL_MS,
  type StoryScene,
} from "../constants";

export interface UseStoryReelResult {
  activeIndex: number;
  activeScene: StoryScene;
  isPaused: boolean;
  isHovering: boolean;
  walkFrameSrc: string;
  selectScene: (index: number) => void;
  togglePaused: () => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
}

export function useStoryReel(): UseStoryReelResult {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [walkStep, setWalkStep] = useState<0 | 1>(0);

  const isAutoAdvancing = !isPaused && !isHovering;

  useEffect(() => {
    if (!isAutoAdvancing) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % STORY_SCENES.length);
    }, STORY_REEL_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isAutoAdvancing]);

  useEffect(() => {
    if (isPaused) return;

    const walkTimer = window.setInterval(() => {
      setWalkStep((step) => (step === 0 ? 1 : 0));
    }, WALK_CYCLE_INTERVAL_MS);

    return () => window.clearInterval(walkTimer);
  }, [isPaused]);

  const selectScene = useCallback((index: number) => {
    const safeIndex = Math.max(0, Math.min(STORY_SCENES.length - 1, index));
    setActiveIndex(safeIndex);
  }, []);

  const togglePaused = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  const activeScene = STORY_SCENES[activeIndex] ?? STORY_SCENES[0];
  const walkFrameSrc =
    walkStep === 0 ? "/mascots/walk-1.png" : "/mascots/walk-2.png";

  return {
    activeIndex,
    activeScene,
    isPaused,
    isHovering,
    walkFrameSrc,
    selectScene,
    togglePaused,
    handleMouseEnter,
    handleMouseLeave,
  };
}
