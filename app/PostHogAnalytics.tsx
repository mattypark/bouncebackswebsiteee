"use client";

import { useEffect } from "react";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const UI_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_REGION === "eu" ? "https://eu.posthog.com" : "https://us.posthog.com";

/**
 * PostHog page analytics: visitors, page views, referrers, clicks, time on
 * page. All of Matthew's sites report into one PostHog project, split by
 * host in the dashboard. Events go through /ingest (a rewrite in
 * next.config.ts) so ad blockers don't drop them. No session replay.
 * No key set → nothing loads.
 */
export function PostHogAnalytics() {
  useEffect(() => {
    if (!KEY) return;
    let cancelled = false;
    // its own chunk, fetched after the page is up: never weighs on first paint
    import("posthog-js").then(({ default: posthog }) => {
      if (cancelled || posthog.__loaded) return;
      posthog.init(KEY, {
        api_host: "/ingest",
        ui_host: UI_HOST,
        capture_pageview: "history_change",
        capture_pageleave: true,
        person_profiles: "identified_only",
        persistence: "localStorage",
        disable_session_recording: true,
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
