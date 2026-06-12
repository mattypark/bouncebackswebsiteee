"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import { VIDEOS } from "@/lib/video-urls";
import PreorderPacksSection from "@/components/PreorderPacksSection";


const videos = [
  VIDEOS.bb1Clip2,
  VIDEOS.bb1Clip3,
  VIDEOS.bb1Clip4,
];

export default function BB1ProductPage() {
  const [activeVideo, setActiveVideo] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  /* Pause all except the active video, autoplay the active one */
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === activeVideo) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [activeVideo]);

  const prev = () => setActiveVideo((i) => (i === 0 ? videos.length - 1 : i - 1));
  const next = () => setActiveVideo((i) => (i === videos.length - 1 ? 0 : i + 1));
  return (
    <div className="min-h-screen bg-bb-cream text-bb-deep">
      <NavBar variant="dark" />


      {/* ─── Hero / Intro Section — text centerpiece w/ scattered balls ─── */}
      <section className="relative flex min-h-[80vh] w-full items-center justify-center overflow-hidden px-6 py-24 md:px-12">
        {/* Scattered balls — absolutely positioned around the text */}
        <Image
          src="/bb1-ball.png"
          alt=""
          width={300}
          height={300}
          priority
          aria-hidden="true"
          className="pointer-events-none absolute left-[4%] top-[14%] w-[90px] rotate-[-18deg] opacity-90 drop-shadow-xl md:w-[180px] lg:w-[230px]"
          style={{ height: "auto" }}
        />
        <Image
          src="/bb1-ball.png"
          alt=""
          width={220}
          height={220}
          priority
          aria-hidden="true"
          className="pointer-events-none absolute right-[6%] top-[8%] w-[70px] rotate-[24deg] opacity-90 drop-shadow-xl md:w-[140px] lg:w-[180px]"
          style={{ height: "auto" }}
        />
        <Image
          src="/bb1-ball.png"
          alt=""
          width={180}
          height={180}
          priority
          aria-hidden="true"
          className="pointer-events-none absolute left-[12%] bottom-[10%] w-[60px] rotate-[12deg] opacity-90 drop-shadow-lg md:w-[120px] lg:w-[150px]"
          style={{ height: "auto" }}
        />
        <Image
          src="/bb1-ball.png"
          alt=""
          width={260}
          height={260}
          priority
          aria-hidden="true"
          className="pointer-events-none absolute right-[3%] bottom-[14%] w-[80px] rotate-[-32deg] opacity-90 drop-shadow-xl md:w-[160px] lg:w-[210px]"
          style={{ height: "auto" }}
        />
        {/* Smaller accent balls — hidden on mobile to avoid clutter */}
        <Image
          src="/bb1-ball.png"
          alt=""
          width={120}
          height={120}
          priority
          aria-hidden="true"
          className="pointer-events-none absolute left-[30%] top-[6%] hidden w-[80px] rotate-[8deg] opacity-80 drop-shadow md:block lg:w-[100px]"
          style={{ height: "auto" }}
        />
        <Image
          src="/bb1-ball.png"
          alt=""
          width={120}
          height={120}
          priority
          aria-hidden="true"
          className="pointer-events-none absolute right-[28%] bottom-[6%] hidden w-[80px] rotate-[-14deg] opacity-80 drop-shadow md:block lg:w-[100px]"
          style={{ height: "auto" }}
        />

        {/* Centered text block */}
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full border border-bb-deep/20 bg-bb-cream/80 px-4 py-1 text-xs font-semibold tracking-[0.18em] text-bb-deep/70 backdrop-blur">
            PREORDER NOW
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight text-bb-deep md:text-5xl lg:text-6xl">
            Introducing the BounceBack BB-1
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-bb-deep/70 md:text-lg">
            Elite performance meets 100% recycled innovation — delivering
            consistent bounce, true spin, and long-lasting outdoor play in a
            precision-engineered ball designed for players and the planet.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm text-bb-deep/50">
            First batch ships in limited quantities. Reserve your pack today —
            you won&rsquo;t be charged extra for being early.
          </p>
          <a
            href="#preorder"
            className="mt-8 inline-block rounded-full bg-bb-deep px-8 py-3.5 text-sm font-semibold tracking-[0.15em] text-bb-cream transition-colors hover:bg-bb-deep/90"
          >
            CHOOSE YOUR PACK
          </a>
        </div>
      </section>

      {/* ─── Pack Selector / Preorder Buy Section ─── */}
      <PreorderPacksSection />

      {/* ─── See the BB-1 In Action ─── */}
      <section className="w-full bg-bb-cream px-6 py-20 md:py-28 lg:py-32">
        <h2 className="text-center text-3xl font-bold tracking-tight text-bb-deep md:text-4xl lg:text-5xl">
          See the BB-1 In Action.
        </h2>

        <div className="relative mx-auto mt-12 flex items-center justify-center gap-6 md:mt-16 md:gap-10">
          {/* Left arrow */}
          <button
            onClick={prev}
            aria-label="Previous video"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bb-lime text-bb-deep transition-colors hover:bg-bb-mid md:h-12 md:w-12"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Phone-shaped video frame */}
          <div className="relative w-[240px] overflow-hidden rounded-2xl bg-black shadow-2xl md:w-[300px] lg:w-[340px]" style={{ aspectRatio: "9 / 16" }}>
            {videos.map((src, i) => (
              <video
                key={src}
                ref={(el) => { videoRefs.current[i] = el; }}
                src={src}
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
                style={{ opacity: i === activeVideo ? 1 : 0 }}
              />
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={next}
            aria-label="Next video"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bb-lime text-bb-deep transition-colors hover:bg-bb-mid md:h-12 md:w-12"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Dot indicators */}
        <div className="mt-8 flex items-center justify-center gap-2.5">
          {videos.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveVideo(i)}
              aria-label={`Go to video ${i + 1}`}
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                i === activeVideo
                  ? "bg-bb-deep scale-110"
                  : "bg-bb-deep/20 hover:bg-bb-deep/40"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ─── Specs / Features Grid ─── */}
      <section className="mx-auto max-w-5xl px-10 py-16 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="border-t border-bb-deep/10 pt-6">
            <h3 className="text-lg font-bold text-bb-deep">100% Recycled</h3>
            <p className="mt-2 text-sm leading-relaxed text-bb-deep/50">
              Made entirely from recycled plastic waste collected through our
              recycling service.
            </p>
          </div>
          <div className="border-t border-bb-deep/10 pt-6">
            <h3 className="text-lg font-bold text-bb-deep">Pro-Level Performance</h3>
            <p className="mt-2 text-sm leading-relaxed text-bb-deep/50">
              Same bounce, weight, and durability as leading professional
              pickleballs. USAPA approved specifications.
            </p>
          </div>
          <div className="border-t border-bb-deep/10 pt-6">
            <h3 className="text-lg font-bold text-bb-deep">40-Hole Design</h3>
            <p className="mt-2 text-sm leading-relaxed text-bb-deep/50">
              Precision-drilled pattern for consistent flight and
              optimal wind resistance.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-bb-deep/10 px-10 py-8 md:px-12 lg:px-16">
        <div className="flex items-end justify-between">
          <p className="text-sm text-bb-deep/30">
            recycled pickleballs. built for players. designed for the planet.
          </p>
          <p className="text-sm text-bb-deep/30">
            &copy; {new Date().getFullYear()} BounceBack
          </p>
        </div>
      </footer>
    </div>
  );
}
