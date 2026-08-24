"use client";

import { motion } from "framer-motion";
import BrandLogo from "./BrandLogo";

/*
  "US VS. THEM" comparison table.

  BounceBack earns a solid ink-and-volt check on every row. Generic balls get
  a lighter green check on the two specs they honestly pass, and a muted X
  everywhere else — so no cell in the column reads as unanswered.
*/

const ROWS: { label: string; generic: boolean }[] = [
  { label: "100% Recycled Materials",     generic: false },
  { label: "USAPA Pro-Approved Spec",     generic: true  },
  { label: "40 Precision Drilled Holes",  generic: true  },
  { label: "Closed-Loop Recycling Program", generic: false },
  { label: "Subscribe & Save Every Order", generic: false },
  { label: "Nationwide Bin Network",      generic: false },
  { label: "Same Bounce as Pro Balls",    generic: false },
];

function CheckIcon({ soft = false }: { soft?: boolean }) {
  return (
    <span
      className={`flex h-8 w-8 items-center justify-center rounded-full ${
        soft ? "bg-bb-mid/15" : "bg-bb-ink"
      }`}
    >
      <svg width="14" height="11" viewBox="0 0 14 11" fill="none" aria-hidden>
        <path
          d="M1 5.5L5 9.5L13 1.5"
          stroke={soft ? "#4a7c62" : "#c6f000"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function XIcon() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.05]">
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
        <path
          d="M1.5 1.5L9.5 9.5M9.5 1.5L1.5 9.5"
          stroke="#9ca3af"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export default function ComparisonSection() {
  return (
    <section className="w-full bg-bb-paper py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="text-center">
          <motion.p
            className="sport-kicker text-bb-mid"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5 }}
          >
            The BounceBack Difference
          </motion.p>
          <motion.h2
            className="sport-display mt-4 text-5xl text-bb-ink md:text-7xl"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            Us vs. Them
          </motion.h2>
          <motion.p
            className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-bb-ink/60 md:text-base"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            BounceBack is the world&apos;s first closed-loop pickleball. Pro-level
            performance, made entirely from balls that finished their life on a
            court like yours.
          </motion.p>
        </div>

        {/* Table */}
        <div className="relative mt-16">
          {/* Column headers */}
          <div className="flex items-end justify-end gap-2 pb-4 md:gap-0">
            <div className="flex w-24 flex-col items-center bg-bb-ink px-2 py-4 text-white md:w-32">
              <BrandLogo size="sm" className="scale-75" />
            </div>
            <div className="w-24 px-2 text-center md:w-32">
              <p className="text-xs font-bold tracking-[0.12em] text-bb-ink/40 uppercase">
                Generic
                <br />
                Balls
              </p>
            </div>
          </div>

          {/* Highlight column background */}
          <div className="pointer-events-none absolute top-16 right-24 bottom-0 w-24 bg-black/[0.04] md:right-32 md:w-32" />

          {ROWS.map((row, i) => (
            <motion.div
              key={row.label}
              className="flex items-center border-t border-black/10 py-4"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <p className="flex-1 pr-4 text-sm font-semibold text-bb-ink md:text-base">
                {row.label}
              </p>
              <div className="flex w-24 justify-center md:w-32">
                <CheckIcon />
              </div>
              <div className="flex w-24 justify-center md:w-32">
                {row.generic ? <CheckIcon soft /> : <XIcon />}
              </div>
            </motion.div>
          ))}
          <div className="border-t border-black/10" />
        </div>

        {/* CTA */}
        <div className="mt-12 flex justify-center">
          <a
            href="/shop"
            className="bg-bb-ink px-10 py-4 text-sm font-black tracking-[0.2em] text-bb-volt uppercase transition-colors duration-200 hover:bg-bb-volt hover:text-bb-ink"
          >
            Make the Switch
          </a>
        </div>
      </div>
    </section>
  );
}
