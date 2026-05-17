"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import { VIDEOS } from "@/lib/video-urls";


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


      {/* ─── Hero Section — Big text + product image ─── */}
      <section className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden">
        {/* Large background text */}
        <h1
          className="pointer-events-none absolute select-none font-black leading-none text-bb-deep/[0.07] whitespace-nowrap"
          style={{
            fontSize: "clamp(6rem, 38vw, 52rem)",
            letterSpacing: "-0.04em",
          }}
        >
          BB-1
        </h1>

        {/* 3-ball stack — pack of 3 layout */}
        <div className="relative z-10 flex items-end justify-center">
          {/* Left ball — behind, lower-left */}
          <Image
            src="/bb1-ball.png"
            alt="BounceBack BB-1"
            width={460}
            height={460}
            priority
            className="w-[140px] -mr-[80px] mb-0 drop-shadow-xl md:w-[380px] md:-mr-[215px] lg:w-[460px] lg:-mr-[340px]"
            style={{ transform: "translateY(15%)", height: "auto" }}
          />
          {/* Center ball — front, top */}
          <Image
            src="/bb1-ball.png"
            alt="BounceBack BB-1"
            width={530}
            height={530}
            priority
            className="relative z-10 w-[160px] drop-shadow-2xl md:w-[440px] lg:w-[530px]"
            style={{ transform: "translateY(-8%)", height: "auto" }}
          />
          {/* Right ball — behind, lower-right */}
          <Image
            src="/bb1-ball.png"
            alt="BounceBack BB-1"
            width={460}
            height={460}
            priority
            className="w-[140px] -ml-[80px] mb-0 drop-shadow-xl md:w-[380px] md:-ml-[215px] lg:w-[460px] lg:-ml-[340px]"
            style={{ transform: "translateY(15%)", height: "auto" }}
          />
        </div>
      </section>

      {/* ─── Product Info Section ─── */}
      <section className="mx-auto max-w-3xl px-10 py-16 text-center md:px-12 lg:px-16">
        <h2 className="text-2xl font-bold text-bb-deep md:text-3xl">
          Introducing the BounceBack BB-1
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-bb-deep/60">
        Elite performance meets 100% recycled innovation - delivering 
        consistent bounce, true spin, and long-lasting outdoor play in a
        precision-engineered designed for players and the planet.

        </p>

        {/* Coming soon badge */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <span className="w-full cursor-not-allowed border-2 border-bb-deep/30 px-10 py-4 text-sm font-semibold tracking-[0.15em] text-bb-deep/30 sm:w-auto text-center">
              BUY 1 PACK
            </span>
            <span className="w-full cursor-not-allowed bg-bb-deep/30 px-10 py-4 text-sm font-semibold tracking-[0.15em] text-bb-cream/50 sm:w-auto text-center">
              MONTHLY SUBSCRIPTION
            </span>
          </div>
          <p className="text-sm font-medium text-bb-deep/50 tracking-wide">
            Coming soon — <a href="/#waitlist" className="underline underline-offset-2 hover:text-bb-deep transition-colors">join the waitlist</a> to be first in line.
          </p>
        </div>
      </section>

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
