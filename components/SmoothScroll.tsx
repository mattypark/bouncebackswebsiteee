"use client";

import { useEffect } from "react";

/*
  SexyCroll-inspired smooth scroll
  Uses a critically-damped spring to interpolate between
  the current scroll position and the target scroll position.
  Handles wheel, keyboard, and touch gracefully.
*/

export default function SmoothScroll() {
  useEffect(() => {
    // Only apply on non-touch devices (touch already has momentum)
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    let current = window.scrollY;
    let target = window.scrollY;
    let rafId: number | null = null;
    const smoothTime = 0.045; // lower = snappier, higher = smoother (0.05-0.15)
    const maxSpeed = 120; // max pixels per frame

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      target += e.deltaY;
      // Clamp target
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      target = Math.max(0, Math.min(target, maxScroll));
    }

    function onKeyDown(e: KeyboardEvent) {
      // Don't hijack keys while typing in form fields
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable)
      ) {
        return;
      }

      const scrollAmount = window.innerHeight * 0.8;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        target += e.key === "PageDown" || e.key === " " ? scrollAmount : 80;
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        target -= e.key === "PageUp" ? scrollAmount : 80;
      } else if (e.key === "Home") {
        e.preventDefault();
        target = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        target =
          document.documentElement.scrollHeight - window.innerHeight;
      }
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      target = Math.max(0, Math.min(target, maxScroll));
    }

    function animate() {
      const diff = target - current;

      // Critically-damped spring interpolation
      let delta = diff * smoothTime;

      // Clamp speed
      if (Math.abs(delta) > maxSpeed) {
        delta = maxSpeed * Math.sign(delta);
      }

      // Snap if close enough
      if (Math.abs(diff) < 0.5) {
        current = target;
      } else {
        current += delta;
      }

      window.scrollTo(0, current);
      rafId = requestAnimationFrame(animate);
    }

    // Sync on manual scroll (e.g. anchor links, scrollTo calls)
    function onScroll() {
      // Only sync if we're not driving the scroll
      if (Math.abs(window.scrollY - current) > 2) {
        current = window.scrollY;
        target = window.scrollY;
      }
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}
