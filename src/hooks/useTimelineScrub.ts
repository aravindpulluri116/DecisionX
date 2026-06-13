"use client";

import { useCallback, useState } from "react";
import type { TimelineMilestone } from "@/types/timemachine";
import { TIMELINE_MILESTONES } from "@/types/timemachine";

export function useTimelineScrub(
  milestone: TimelineMilestone,
  onMilestone: (m: TimelineMilestone) => void,
) {
  const [dragging, setDragging] = useState(false);

  const index = TIMELINE_MILESTONES.indexOf(milestone);

  const scrubToIndex = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(TIMELINE_MILESTONES.length - 1, i));
      onMilestone(TIMELINE_MILESTONES[clamped]);
    },
    [onMilestone],
  );

  const next = useCallback(() => scrubToIndex(index + 1), [index, scrubToIndex]);
  const prev = useCallback(() => scrubToIndex(index - 1), [index, scrubToIndex]);

  return { index, dragging, setDragging, scrubToIndex, next, prev, milestones: TIMELINE_MILESTONES };
}
