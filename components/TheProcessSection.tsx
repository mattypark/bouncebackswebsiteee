"use client";

import { useState } from "react";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { VIDEOS } from "@/lib/video-urls";

/*
  "How does it work?" — rotatable video carousel.

  Three phone-frame videos: the active one sits center and large, the other
  two flank it smaller and rotated back into space. Drag the deck left or
  right and the whole stack rotates with your hand; release past the
  threshold and it advances. Arrows, side-taps, and the step bars still work
  for anyone who never drags.
*/

const STEPS = [
  {
    number: "1",
    title: "Collect",
    body: "Cracked pickleballs are collected in BounceBack recycling bins by sustainable facility members across the country and shipped back to us for reprocessing before they ever reach a landfill.",
    video: VIDEOS.process1,
  },
  {
    number: "2",
    title: "Grind",
    body: "Collected balls go through our multi-step process to be broken down into clean, raw, ready-to-go material for manufacturing.",
    video: VIDEOS.process2,
  },
  {
    number: "3",
    title: "Remold",
    body: "Our material is then remolded into brand-new pickleballs, retaining the same feel & same bounce as professional-grade balls.",
    video: VIDEOS.process3,
  },
];

// Drag distance (px) past which a release advances the deck
const SWIPE_THRESHOLD = 70;

function ArrowButton({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={direction === "left" ? "Previous step" : "Next step"}
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bb-deep text-white transition-colors duration-200 hover:bg-bb-volt hover:text-bb-ink md:h-14 md:w-14"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transform: direction === "left" ? "rotate(180deg)" : undefined }}
      >
        <line x1="3" y1="12" x2="21" y2="12" />
        <polyline points="13 4 21 12 13 20" />
      </svg>
    </button>
  );
}

export default function TheProcessSection() {
  const [active, setActive] = useState(0);

  // Horizontal drag drives the deck rotation live, before any step change
  const dragX = useMotionValue(0);
  const deckRotate = useTransform(dragX, [-220, 0, 220], [10, 0, -10]);
  const deckSkew = useTransform(dragX, [-220, 0, 220], [-3, 0, 3]);

  const goTo = (i: number) => setActive((i + STEPS.length) % STEPS.length);

  function handleDragEnd(_: unknown, info: PanInfo) {
    const travel = info.offset.x + info.velocity.x * 0.08;
    if (travel <= -SWIPE_THRESHOLD) goTo(active + 1);
    else if (travel >= SWIPE_THRESHOLD) goTo(active - 1);
  }

  // Render order: [previous, active, next] so the active video is always the
  // middle flex child; layout animations morph each card into place.
  const prev = (active + STEPS.length - 1) % STEPS.length;
  const next = (active + 1) % STEPS.length;
  const ordered = [STEPS[prev], STEPS[active], STEPS[next]];

  return (
    <section
      id="how-it-works"
      className="relative w-full overflow-hidden bg-bb-paper py-24 md:py-32"
    >
      {/* Court glow behind the deck */}
      <div
        className="pointer-events-none absolute inset-x-0 top-1/3 h-[420px] bg-[radial-gradient(600px_260px_at_50%_50%,rgba(198,240,0,0.16),transparent_70%)]"
        aria-hidden
      />

      <div className="relative z-10">
        {/* Heading */}
        <div className="px-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="slash-pair text-bb-mid" aria-hidden>
              <span />
              <span />
            </span>
            <p className="sport-kicker text-bb-mid">The Closed Loop</p>
          </div>
          <h2 className="sport-display mt-5 text-5xl text-bb-deep md:text-8xl">
            How does it work?
          </h2>
        </div>

        {/* Carousel — drag to rotate */}
        <div className="mx-auto mt-12 flex max-w-5xl items-center justify-center gap-3 px-4 md:mt-16 md:gap-8">
          <ArrowButton direction="left" onClick={() => goTo(active - 1)} />

          <LayoutGroup>
            <motion.div
              className="flex cursor-grab items-center justify-center gap-3 active:cursor-grabbing md:gap-6"
              style={{ x: dragX, rotate: deckRotate, skewX: deckSkew, perspective: 1200 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.22}
              onDragEnd={handleDragEnd}
            >
              {ordered.map((step) => {
                const isActive = step.number === STEPS[active].number;
                const isPrev = step === ordered[0];
                return (
                  <motion.button
                    key={step.number}
                    layout
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                    onClick={() => goTo(STEPS.indexOf(step))}
                    animate={{
                      rotate: isActive ? 0 : isPrev ? -10 : 10,
                      opacity: isActive ? 1 : 0.5,
                      scale: isActive ? 1 : 0.94,
                    }}
                    aria-label={`Step ${step.number}: ${step.title}`}
                    className={`relative overflow-hidden rounded-[1.8rem] border-[6px] border-bb-deep bg-black ${
                      isActive
                        ? "z-10 w-[58vw] max-w-[320px] shadow-[0_28px_60px_-18px_rgba(8,71,52,0.55)] md:w-[300px]"
                        : "hidden w-[30vw] max-w-[170px] shadow-lg sm:block md:w-[164px]"
                    }`}
                    style={{ aspectRatio: "9 / 16" }}
                  >
                    <video
                      src={step.video}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="pointer-events-none h-full w-full object-cover"
                    />

                    {/* Step chip on the active phone */}
                    {isActive && (
                      <span className="absolute top-3 left-3 rounded-full bg-bb-volt px-3 py-1 text-[10px] font-black tracking-[0.14em] text-bb-ink uppercase">
                        Step {step.number}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </LayoutGroup>

          <ArrowButton direction="right" onClick={() => goTo(active + 1)} />
        </div>

        {/* Step bars */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {STEPS.map((step, i) => (
            <button
              key={step.number}
              onClick={() => goTo(i)}
              aria-label={`Go to step ${step.number}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? "w-12 bg-bb-deep" : "w-6 bg-bb-deep/20 hover:bg-bb-deep/40"
              }`}
            />
          ))}
        </div>

        <p className="mt-4 text-center text-[11px] font-bold tracking-[0.16em] text-bb-deep/35 uppercase">
          Drag to rotate
        </p>

        {/* Active step text */}
        <div className="mx-auto mt-8 max-w-xl px-6 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <p className="sport-display text-4xl text-bb-deep md:text-5xl">
                {STEPS[active].number}. {STEPS[active].title}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-bb-deep/70 md:text-base">
                {STEPS[active].body}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
