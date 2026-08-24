"use client";

import { useRef, useEffect } from "react";

export default function RecycledRevealSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const wordsRef = useRef<HTMLSpanElement[]>([]);

  // Auto-play video when in view
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  // Word-by-word scroll reveal
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    function onScroll() {
      const rect = section!.getBoundingClientRect();
      const windowH = window.innerHeight;

      const start = windowH * 1.0;
      const end = windowH * 0.6;
      const sectionCenter = rect.top + rect.height / 2;
      const progress = 1 - (sectionCenter - end) / (start - end);
      const clampedProgress = Math.max(0, Math.min(1, progress));

      const words = wordsRef.current;
      const totalWords = words.length;

      words.forEach((word, i) => {
        if (!word) return;
        const wordStart = i / totalWords;
        const wordEnd = (i + 1) / totalWords;
        const wordProgress = (clampedProgress - wordStart) / (wordEnd - wordStart);
        const clampedWordProgress = Math.max(0, Math.min(1, wordProgress));
        const opacity = 0.15 + clampedWordProgress * 0.85;
        word.style.opacity = String(opacity);
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headlineWords = "We built pickleball's first closed-loop recycling bin.".split(" ");

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-white py-24 md:py-32 lg:py-40"
    >
      {/* Headline — single line, word-by-word scroll reveal */}
      <div className="mx-auto mb-16 px-8 md:mb-20 md:px-14 lg:px-20">
        <p className="md:whitespace-nowrap text-center text-3xl font-bold text-bb-deep md:text-5xl lg:text-6xl">
          {headlineWords.map((word, i) => (
            <span
              key={i}
              ref={(el) => {
                if (el) wordsRef.current[i] = el;
              }}
              className="inline-block transition-opacity duration-300 ease-out"
              style={{ opacity: 0.15, marginRight: "0.3em" }}
            >
              {word}
            </span>
          ))}
        </p>
      </div>

      {/* Video — framed device with color grading */}
      <div className="relative mx-auto w-[78%] max-w-[440px] md:w-[52%] lg:w-[36%]">
        {/* Outer accent ring */}
        <div className="recycled-frame-outer">
          {/* Black bezel */}
          <div className="recycled-frame-bezel">
            <div className="relative overflow-hidden rounded-[26px] bg-black">
              <video
                ref={videoRef}
                src="/recycled-reveal.mp4"
                muted
                playsInline
                loop
                preload="metadata"
                className="recycled-video block w-full"
              />
              {/* Subtle vignette to cover edge artifacts */}
              <div className="recycled-vignette pointer-events-none absolute inset-0" />
            </div>
          </div>
        </div>

        {/* Caption beneath the frame */}
        <p className="recycled-caption mt-5 text-center text-xs font-semibold uppercase tracking-[0.22em] text-bb-deep/60 md:text-sm">
          Drop in. We do the rest.
        </p>
      </div>

      <style jsx>{`
        .recycled-frame-outer {
          padding: 8px;
          border-radius: 40px;
          background: linear-gradient(
            145deg,
            rgba(8, 71, 52, 0.18),
            rgba(8, 71, 52, 0)
          );
        }

        .recycled-frame-bezel {
          padding: 10px;
          border-radius: 32px;
          background: #0a0a0a;
          box-shadow:
            0 50px 100px -40px rgba(8, 71, 52, 0.45),
            0 20px 40px -20px rgba(10, 10, 10, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .recycled-video {
          /* Color grade — turns raw phone footage into something curated */
          filter: contrast(1.08) saturate(1.18) brightness(1.06);
        }

        .recycled-vignette {
          background: radial-gradient(
            ellipse at center,
            transparent 55%,
            rgba(0, 0, 0, 0.35) 100%
          );
          mix-blend-mode: multiply;
        }

        .recycled-caption {
          opacity: 0;
          transform: translateY(6px);
          animation: recycled-caption-in 0.7s ease-out 0.4s forwards;
        }

        @keyframes recycled-caption-in {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
