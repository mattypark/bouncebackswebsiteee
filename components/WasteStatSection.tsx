"use client";

import { useEffect, useRef, useState, useMemo } from "react";

/* ────────────────────────────────────────────
   Odometer-style digit roller
   Each digit column shows 0-9 stacked vertically
   and translates upward to reveal the target digit.
   ──────────────────────────────────────────── */

function DigitColumn({
  digit,
  animate,
  delay,
}: {
  digit: number;
  animate: boolean;
  delay: number;
}) {
  return (
    <span className="inline-block overflow-hidden" style={{ height: "1em" }}>
      <span
        className="inline-flex flex-col"
        style={{
          transform: animate ? `translateY(-${digit * 10}%)` : "translateY(0%)",
          transition: animate
            ? `transform 1.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
            : "none",
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span
            key={n}
            className="block text-center leading-none"
            style={{ height: "1em" }}
            aria-hidden={n !== digit}
          >
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

function CommaChar() {
  return (
    <span className="inline-block leading-none" style={{ height: "1em" }}>
      ,
    </span>
  );
}

/* Format target number into an array of { type, value } for rendering */
function getDigitParts(n: number): { type: "digit" | "comma"; value: number }[] {
  const formatted = n.toLocaleString("en-US");
  return formatted.split("").map((ch) =>
    ch === ","
      ? { type: "comma" as const, value: 0 }
      : { type: "digit" as const, value: parseInt(ch, 10) }
  );
}

export default function WasteStatSection() {
  const [hasStarted, setHasStarted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const TARGET = 770000;
  const parts = useMemo(() => getDigitParts(TARGET), []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasStarted]);

  // Stagger delays: rightmost digits start first for a rolling feel
  const digitCount = parts.filter((p) => p.type === "digit").length;
  let digitIndex = 0;

  // Total odometer roll duration (longest delay + animation length)
  const ODOMETER_DURATION_MS = 1600 + (digitCount - 1) * 70;

  return (
    <section
      ref={sectionRef}
      className="waste-stat-section relative flex w-full items-center justify-center overflow-hidden py-28 md:py-40"
    >
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 text-center">
        {/* Eyebrow */}
        <p
          className={`waste-stat-eyebrow text-xs font-semibold uppercase tracking-[0.22em] text-bb-deep/80 md:text-sm ${
            hasStarted ? "is-in" : ""
          }`}
        >
          Pickleball Creates
        </p>

        {/* Stat Number */}
        <h2
          className={`waste-stat-number font-bold leading-none tracking-tight text-bb-deep whitespace-nowrap ${
            hasStarted ? "is-in" : ""
          }`}
          style={{ fontSize: "clamp(2.5rem, 14vw, 22rem)" }}
          aria-label={TARGET.toLocaleString("en-US")}
        >
          {parts.map((part, i) => {
            if (part.type === "comma") {
              return <CommaChar key={`c-${i}`} />;
            }
            const idx = digitIndex++;
            const delay = (digitCount - 1 - idx) * 0.07;
            return (
              <DigitColumn
                key={`d-${i}`}
                digit={part.value}
                animate={hasStarted}
                delay={delay}
              />
            );
          })}
        </h2>

        {/* Caption */}
        <p
          className={`waste-stat-caption mt-6 text-base font-medium text-bb-deep/85 md:mt-8 md:text-xl ${
            hasStarted ? "is-in" : ""
          }`}
        >
          pounds of plastic waste, every year.
        </p>

        {/* Animated divider line */}
        <div
          className={`waste-stat-rule mt-10 md:mt-14 ${hasStarted ? "is-in" : ""}`}
          style={{
            transitionDelay: `${ODOMETER_DURATION_MS}ms`,
          }}
          aria-hidden
        />
      </div>

      <style jsx>{`
        .waste-stat-section {
          background: #CEF17B;
        }

        .waste-stat-eyebrow,
        .waste-stat-caption {
          opacity: 0;
          transform: translateY(8px);
          transition:
            opacity 0.7s ease-out,
            transform 0.7s ease-out;
        }
        .waste-stat-eyebrow.is-in,
        .waste-stat-caption.is-in {
          opacity: 1;
          transform: translateY(0);
        }
        .waste-stat-caption.is-in {
          transition-delay: 0.25s;
        }

        .waste-stat-number {
          opacity: 0;
          transform: translateY(12px);
          transition:
            opacity 0.7s ease-out 0.1s,
            transform 0.7s ease-out 0.1s;
        }
        .waste-stat-number.is-in {
          opacity: 1;
          transform: translateY(0);
        }

        .waste-stat-rule {
          width: clamp(80px, 12vw, 160px);
          height: 2px;
          background: rgba(8, 71, 52, 0.55);
          transform-origin: center;
          transform: scaleX(0);
          opacity: 0;
          transition:
            transform 0.9s cubic-bezier(0.65, 0, 0.2, 1),
            opacity 0.4s ease-out;
        }
        .waste-stat-rule.is-in {
          transform: scaleX(1);
          opacity: 1;
        }
      `}</style>
    </section>
  );
}
