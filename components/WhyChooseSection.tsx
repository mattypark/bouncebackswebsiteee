"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

/*
  "Why choose BounceBack?" — glass cards on the ink court.

  Frosted panels (backdrop blur + a top-edge specular highlight) instead of
  the old lime-outlined white boxes. Each card tilts toward the cursor, which
  ties this block to the rotatable phone carousel above it. Copy is unchanged.
*/

const CARDS = [
  {
    number: "01",
    title: "Closed Loop Recycling.",
    body: "We're recycling old and cracked pickleballs to fully close the loop and give balls a second life to save the environment in the sport we love.",
    icon: (
      <Image
        src="/actrecycling.png"
        alt=""
        aria-hidden
        width={26}
        height={26}
        className="h-[26px] w-[26px]"
      />
    ),
  },
  {
    number: "02",
    title: "1-1 Same feel with Pro Pickleballs.",
    body: "Our recycling and remanufacturing process is designed to replicate the same experience as a professional pickleball.",
    icon: <span className="text-2xl leading-none font-black text-bb-ink">=</span>,
  },
  {
    number: "03",
    title: "Trusted by the community.",
    body: "Our transparent process allows you to watch the steps we've taken to get here as well as see our future plans for the movement.",
    icon: (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-bb-ink"
        aria-hidden
      >
        <path d="m11 17 2 2a1 1 0 1 0 3-3" />
        <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
        <path d="m21 3 1 11h-2" />
        <path d="M3 3 2 14h2" />
        <path d="m3 4 2.71.71a2 2 0 0 0 1.42-.25l.47-.28a5.79 5.79 0 0 1 4.4-.69" />
        <path d="m6 16 2 2a1 1 0 1 0 3-3" />
      </svg>
    ),
  },
];

const MAX_TILT = 7; // degrees — enough to read as 3D, not enough to fight the text

function GlassCard({ card, index }: { card: (typeof CARDS)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handleMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -py * MAX_TILT * 2, y: px * MAX_TILT * 2 });
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 900 }}
    >
      <motion.article
        className="group relative h-full overflow-hidden rounded-2xl border border-white/15 bg-white/[0.07] p-8 backdrop-blur-xl"
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Specular edge — the highlight that sells the glass */}
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
          aria-hidden
        />
        {/* Volt bloom that wakes up on hover */}
        <span
          className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-bb-volt/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
          aria-hidden
        />

        <div className="relative flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bb-volt">
            {card.icon}
          </div>
          <span className="sport-display text-4xl text-white/15">{card.number}</span>
        </div>

        <h3 className="sport-display relative mt-7 text-2xl text-white md:text-[1.75rem]">
          {card.title}
        </h3>
        <p className="relative mt-4 text-sm leading-relaxed text-white/60 md:text-base">
          {card.body}
        </p>
      </motion.article>
    </motion.div>
  );
}

export default function WhyChooseSection() {
  return (
    <section className="hero-gradient-sport relative w-full overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-14 text-center">
          <motion.div
            className="flex items-center justify-center gap-3"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5 }}
          >
            <span className="slash-pair text-bb-volt" aria-hidden>
              <span />
              <span />
            </span>
            <p className="sport-kicker text-bb-volt/80">Built Different</p>
          </motion.div>

          <motion.h2
            className="sport-display mt-5 text-5xl text-white md:text-7xl"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            Why choose <span className="text-bb-volt">BounceBack</span>?
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {CARDS.map((card, i) => (
            <GlassCard key={card.number} card={card} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
