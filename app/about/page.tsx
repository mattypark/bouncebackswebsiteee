"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import SiteFooter from "@/components/SiteFooter";

/*
  Our Story — rebuilt on the sports system (ink / paper / volt, sport-display
  type, slash motif). The old milestone timeline is gone; the story now runs
  hero → founder → values → the numbers → CTA.
*/

function Reveal({
  children,
  delay = 0,
  y = 40,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Slash({ className = "" }: { className?: string }) {
  return (
    <span className={`slash-pair ${className}`} aria-hidden>
      <span />
      <span />
    </span>
  );
}

const VALUES = [
  {
    number: "01",
    title: "Sustainability First",
    body: "Every ball we make is 100% recycled. We built BounceBack on the belief that the industry deserves a real solution to its waste problem, and we're transparent about every step — from collection to court.",
  },
  {
    number: "02",
    title: "Player-Grade Performance",
    body: "Recycled doesn't mean compromised. The BB-1 meets the same bounce, weight, and durability standards as the top balls on the market. Sustainability only wins if the product stands on its own.",
  },
  {
    number: "03",
    title: "Community Driven",
    body: "From our recycling bin program to partnerships with courts and clubs, BounceBack runs on the energy of players who care about the sport and the planet.",
  },
];

const NUMBERS = [
  { stat: "2.2M+", label: "Balls cracked every year", sub: "Headed straight to landfill" },
  { stat: "10,000+", label: "Balls recycled so far", sub: "Collected through our bins" },
  { stat: "#1", label: "Fastest-growing sport in the US", sub: "More players, more broken balls" },
  { stat: "0", label: "Programs before us", sub: "We built the first closed loop" },
];

export default function AboutPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-bb-paper text-bb-ink">
      <NavBar variant="dark" />

      {/* ══════════ HERO ══════════ */}
      <section
        ref={heroRef}
        className="relative flex min-h-[80vh] w-full items-center justify-center overflow-hidden"
      >
        <motion.h1
          style={{ y: heroY, opacity: heroOpacity }}
          className="sport-display pointer-events-none absolute leading-none whitespace-nowrap text-bb-ink/[0.05] select-none"
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
        >
          <span style={{ fontSize: "clamp(5rem, 28vw, 42rem)" }}>ABOUT</span>
        </motion.h1>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-8 pt-24 text-center">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Slash className="text-bb-mid" />
            <p className="sport-kicker text-bb-mid">Our Story</p>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="sport-display mt-6 text-5xl text-bb-ink md:text-7xl lg:text-8xl"
          >
            Built to play.
            <br />
            <span className="text-bb-mid">Built to come back.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 max-w-xl text-base leading-relaxed text-bb-ink/60 md:text-lg"
          >
            BounceBack is on a mission to eliminate pickleball waste — the world&apos;s
            first closed-loop pickleball company, keeping the sport we love sustainable
            without giving up a thing on performance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-14 flex flex-col items-center gap-2"
          >
            <span className="sport-kicker text-bb-ink/30">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="h-8 w-[1px] bg-bb-ink/20"
            />
          </motion.div>
        </div>
      </section>

      {/* ══════════ FOUNDER ══════════ */}
      <section className="hero-gradient-sport relative w-full overflow-hidden py-24 md:py-32">
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-16 px-8 md:flex-row md:items-start md:gap-20 lg:px-16">
          <Reveal className="relative shrink-0" delay={0.1}>
            <div className="relative">
              <div className="absolute -right-4 -bottom-4 h-full w-full rounded-2xl border-2 border-bb-volt/30" />
              <div className="relative h-[380px] w-[300px] overflow-hidden rounded-2xl bg-white/5 md:h-[480px] md:w-[360px]">
                <Image
                  src="/dillon.png"
                  alt="Dillon Rosenthal — Founder of BounceBack"
                  width={360}
                  height={480}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-5 -left-4 bg-bb-volt px-5 py-2.5 md:-left-8"
              >
                <span className="text-[10px] font-black tracking-[0.18em] text-bb-ink uppercase">
                  Founder &amp; CEO
                </span>
              </motion.div>
            </div>
          </Reveal>

          <div className="flex flex-1 flex-col justify-center text-left">
            <Reveal delay={0.15}>
              <div className="flex items-center gap-3">
                <Slash className="text-bb-volt" />
                <p className="sport-kicker text-bb-volt/70">Meet the Founder</p>
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <h3 className="sport-display mt-5 text-5xl text-white md:text-6xl lg:text-7xl">
                Dillon
                <br />
                <span className="text-bb-volt">Rosenthal</span>
              </h3>
            </Reveal>

            <Reveal delay={0.4}>
              <p className="mt-7 max-w-lg text-base leading-relaxed text-white/65 md:text-lg">
                As an avid pickleball player, Dillon saw firsthand the staggering amount of
                plastic waste the sport generates — cracked balls tossed after every session
                with no end-of-life solution.
              </p>
            </Reveal>

            <Reveal delay={0.5}>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-white/65 md:text-lg">
                That concern turned into a question worth solving:{" "}
                <span className="font-bold text-bb-volt">
                  what if every discarded pickleball became a brand-new one?
                </span>
              </p>
            </Reveal>

            <Reveal delay={0.6}>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-white/65 md:text-lg">
                Today BounceBack runs the first closed-loop recycling system for pickleballs —
                collecting, processing, and remanufacturing balls that play as well as anything
                on the market, while cleaning up our game.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════ VALUES ══════════ */}
      <section className="w-full bg-bb-paper py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-8 lg:px-16">
          <Reveal>
            <div className="flex items-center gap-3">
              <Slash className="text-bb-mid" />
              <p className="sport-kicker text-bb-mid">What We Stand For</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h3 className="sport-display mt-5 text-4xl text-bb-ink md:text-6xl">
              Our Values
            </h3>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-0 md:grid-cols-3">
            {VALUES.map((v, i) => (
              <Reveal key={v.number} delay={0.1 + i * 0.12}>
                <div className="group relative border-t border-bb-ink/10 py-10 pr-8 first:md:border-l-0 first:md:pl-0 md:border-t-0 md:border-l md:py-2 md:pr-6 md:pl-8">
                  <div className="absolute top-0 left-0 h-[2px] w-0 bg-bb-volt transition-all duration-500 group-hover:w-full md:h-full md:w-[2px] md:group-hover:w-[2px]" />
                  <span className="sport-display text-5xl text-bb-mid/25">{v.number}</span>
                  <h4 className="mt-4 text-lg font-black tracking-wide text-bb-ink uppercase">
                    {v.title}
                  </h4>
                  <p className="mt-3 text-sm leading-relaxed text-bb-ink/55">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ THE NUMBERS ══════════ */}
      <section className="w-full bg-bb-court py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-8 lg:px-16">
          <Reveal>
            <div className="flex items-center gap-3">
              <Slash className="text-bb-mid" />
              <p className="sport-kicker text-bb-mid">Why It Matters</p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {NUMBERS.map((n, i) => (
              <Reveal key={n.label} delay={i * 0.08}>
                <div className="h-full rounded-xl border border-black/10 bg-bb-paper p-5">
                  <div className="flex items-center gap-2">
                    <Slash className="text-bb-mid" />
                    <p className="sport-display text-4xl text-bb-ink">{n.stat}</p>
                  </div>
                  <p className="mt-2 text-xs font-black tracking-wide text-bb-ink uppercase">
                    {n.label}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-bb-ink/55">{n.sub}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="hero-gradient-sport relative w-full overflow-hidden">
        <motion.div
          className="pointer-events-none absolute z-[1] w-[60px] md:w-[90px]"
          style={{ top: "14%", left: "7%" }}
          animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image src="/bb1-ball.png" alt="" aria-hidden width={90} height={90} className="h-auto w-full opacity-25" />
        </motion.div>
        <motion.div
          className="pointer-events-none absolute z-[1] w-[75px] md:w-[110px]"
          style={{ right: "6%", bottom: "16%" }}
          animate={{ y: [0, -12, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <Image src="/bb1-ball.png" alt="" aria-hidden width={110} height={110} className="h-auto w-full opacity-20" />
        </motion.div>

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-8 py-24 text-center md:py-32">
          <Reveal>
            <h3 className="sport-display text-4xl text-white md:text-6xl">
              Ready to play different?
            </h3>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/70 md:text-lg">
              Join thousands of players choosing performance and sustainability.
              The future of pickleball starts with you.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="/shop/12"
                className="bg-bb-volt px-10 py-4 text-sm font-black tracking-[0.18em] text-bb-ink uppercase transition-colors duration-300 hover:bg-white"
              >
                Buy BB-1
              </a>
              <a
                href="/request-bin"
                className="border-2 border-white/40 px-10 py-4 text-sm font-semibold tracking-[0.18em] text-white uppercase transition-all duration-300 hover:border-white hover:bg-white/10"
              >
                Order a Recycling Bin
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
