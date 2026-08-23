"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/track";
import type { EventType } from "@/lib/events";

/**
 * Reports that a page was seen, once per page.
 *
 * The guard is not ceremony: React mounts effects twice in development, and
 * without it every local page view would arrive as two, which is the kind of
 * quiet doubling that makes a funnel look better than the shop really is.
 */
export function TrackView({ type, slug }: { type: EventType; slug?: string }) {
  const reported = useRef<string | null>(null);
  const key = `${type}:${slug ?? ""}`;

  useEffect(() => {
    if (reported.current === key) return;
    reported.current = key;
    track(type, { slug });
  }, [key, type, slug]);

  return null;
}
