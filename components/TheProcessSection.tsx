"use client";

import { useEffect, useRef, useState } from "react";

const STEPS = [
  {
    number: "1",
    title: "Collect",
    body: "Cracked pickleballs are collected in BounceBack bins and shipped out for reprocessing before they ever reach a landfill.",
    video: "/process1.mp4",
  },
  {
    number: "2",
    title: "Grind",
    body: "Collected balls are broken down into raw material.",
    video: "/process2.mp4",
  },
  {
    number: "3",
    title: "Remold",
    body: "That material is remolded into new pickleballs, retaining the same feel & same bounce.",
    video: "/process3.mp4",
  },
];

const HEADLINE_WORDS = "How does it work?".split(" ");

// Scroll-progress phase boundaries within the pin
const INTRO_END = 0.30; // 0 → 0.30: word reveal (heading centered)
const SLIDE_END = 0.50; // 0.30 → 0.50: heading slides down + grid fades in
// 0.50 → 1.0: 3-step progression

export default function TheProcessSection() {
  const [active, setActive] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const lockUntilRef = useRef<number>(0);

  // Play/pause videos when active changes
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === active) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [active]);

  // Scroll-driven multi-phase animation
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let ticking = false;
    let rafId = 0;
    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

    const update = () => {
      ticking = false;
      if (window.innerWidth <= 860) return;

      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      if (total <= 0) return;

      const p = clamp01(-rect.top / total);

      // Phase 1: word opacity reveal (centered heading)
      const introP = clamp01(p / INTRO_END);
      const totalWords = wordRefs.current.length;
      wordRefs.current.forEach((w, i) => {
        if (!w) return;
        const wStart = i / totalWords;
        const wEnd = (i + 1) / totalWords;
        const wp = clamp01((introP - wStart) / (wEnd - wStart));
        w.style.opacity = String(0.15 + wp * 0.85);
      });

      // Phase 2: heading slides down + scales down to its "above 123" position;
      // grid fades in
      const slideP = clamp01((p - INTRO_END) / (SLIDE_END - INTRO_END));
      // Inverse so 1 = "intro state", 0 = "settled state"
      const intro = 1 - slideP;
      if (headingRef.current) {
        // 25vh down + 1.5x scale at start, 0 + 1x at end
        const ty = intro * 25;
        const scale = 1 + intro * 0.5;
        headingRef.current.style.transform = `translateY(${ty}vh) scale(${scale})`;
      }
      if (gridRef.current) {
        gridRef.current.style.opacity = String(slideP);
      }

      // Phase 3: active step
      const stepP = clamp01((p - SLIDE_END) / (1 - SLIDE_END));
      let next = 0;
      if (stepP >= 2 / 3) next = 2;
      else if (stepP >= 1 / 3) next = 1;
      if (Date.now() >= lockUntilRef.current) {
        setActive((prev) => (prev === next ? prev : next));
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleJump = (i: number) => {
    lockUntilRef.current = Date.now() + 600;
    setActive(i);
  };

  const arrowOffset = `${active * 100}%`;

  return (
    <section className="process-section relative w-full bg-bb-cream">
      <div className="process-track" ref={trackRef}>
        <div className="process-sticky">
          <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
            <h2 className="process-heading" ref={headingRef}>
              {HEADLINE_WORDS.map((word, i) => (
                <span
                  key={i}
                  ref={(el) => {
                    wordRefs.current[i] = el;
                  }}
                  className="process-heading-word"
                >
                  {word}
                </span>
              ))}
            </h2>

            <div className="process-grid" ref={gridRef}>
              {/* Left: phone-frame video */}
              <div className="process-left">
                <div className="process-phone">
                  <div className="process-phone-screen">
                    {STEPS.map((step, i) => (
                      <video
                        key={i}
                        ref={(el) => {
                          videoRefs.current[i] = el;
                        }}
                        src={step.video}
                        muted
                        playsInline
                        loop
                        preload="metadata"
                        className="process-video"
                        style={{ opacity: active === i ? 1 : 0 }}
                      />
                    ))}
                  </div>
                </div>

                <div className="process-dots">
                  {STEPS.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Go to step ${i + 1}`}
                      onClick={() => handleJump(i)}
                      className={`process-dot${active === i ? " is-active" : ""}`}
                    />
                  ))}
                </div>
              </div>

              {/* Right: numerals + arrow + copy */}
              <div className="process-right">
                <div className="process-numerals">
                  {STEPS.map((step, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleJump(i)}
                      className={`process-numeral${active === i ? " is-active" : ""}`}
                      aria-label={`Step ${step.number}: ${step.title}`}
                    >
                      {step.number}
                    </button>
                  ))}

                  <div
                    className="process-arrow"
                    style={{ transform: `translateY(${arrowOffset})` }}
                    aria-hidden
                  >
                    <svg
                      viewBox="0 0 120 24"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      {/* Horizontal shaft */}
                      <line x1="118" y1="12" x2="10" y2="12" />
                      {/* Arrowhead pointing left */}
                      <polyline points="22,2 10,12 22,22" />
                    </svg>
                  </div>
                </div>

                <div className="process-copy">
                  {STEPS.map((step, i) => (
                    <div
                      key={i}
                      className={`process-copy-slide${active === i ? " is-active" : ""}`}
                      aria-hidden={active !== i}
                    >
                      <p className="process-copy-title">{step.title}</p>
                      <p className="process-copy-body">{step.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .process-track {
          height: 400vh;
          position: relative;
        }

        .process-sticky {
          position: sticky;
          top: 0;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: clamp(4rem, 8vh, 8rem) 0;
        }

        .process-heading {
          text-align: center;
          font-size: clamp(28px, 4.5vw, 56px);
          font-weight: 700;
          color: #0a0a0a;
          margin-bottom: clamp(2.5rem, 6vh, 5rem);
          letter-spacing: -0.02em;
          transform-origin: center top;
          will-change: transform;
        }

        .process-heading-word {
          display: inline-block;
          margin-right: 0.3em;
          opacity: 0.15;
          transition: opacity 0.2s ease-out;
        }

        .process-grid {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
          gap: clamp(2rem, 5vw, 5rem);
          align-items: center;
          opacity: 0;
          will-change: opacity;
        }

        /* Left — phone */
        .process-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        .process-phone {
          width: min(100%, 360px);
          aspect-ratio: 9 / 16;
          border: 6px solid #0a0a0a;
          border-radius: 32px;
          padding: 4px;
          background: #0a0a0a;
          box-shadow: 0 40px 80px -40px rgba(10, 10, 10, 0.35);
        }

        .process-phone-screen {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 24px;
          overflow: hidden;
          background: #e5fccd;
        }

        .process-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 500ms ease-in-out;
        }

        .process-dots {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          justify-content: center;
        }

        .process-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          border: 1px solid rgba(8, 71, 52, 0.3);
          background: transparent;
          transition: all 300ms ease;
          cursor: pointer;
        }

        .process-dot:hover {
          border-color: rgba(8, 71, 52, 0.6);
        }

        .process-dot.is-active {
          background: #084734;
          border-color: #084734;
          transform: scale(1.1);
        }

        /* Right — numerals + arrow + copy */
        .process-right {
          display: flex;
          flex-direction: column;
          gap: clamp(1.5rem, 3vh, 3rem);
          width: 100%;
        }

        .process-numerals {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: clamp(0.25rem, 1vh, 0.75rem);
          padding-right: clamp(60px, 8vw, 110px);
          align-items: flex-start;
        }

        .process-numeral {
          background: none;
          border: none;
          padding: 0;
          margin: 0;
          cursor: pointer;
          font-family: inherit;
          font-size: clamp(96px, 12vw, 180px);
          font-weight: 700;
          line-height: 0.95;
          letter-spacing: -0.05em;
          color: rgba(8, 71, 52, 0.22);
          transition: color 0.6s ease;
          text-align: left;
        }

        .process-numeral.is-active {
          color: #084734;
        }

        .process-arrow {
          position: absolute;
          left: clamp(110px, 14vw, 220px);
          top: 0;
          height: clamp(96px, 12vw, 180px);
          width: clamp(120px, 14vw, 200px);
          color: #084734;
          transition: transform 0.8s cubic-bezier(0.65, 0, 0.2, 1);
          pointer-events: none;
          display: flex;
          align-items: center;
        }

        .process-arrow :global(svg) {
          width: 100%;
          height: 100%;
        }

        .process-copy {
          position: relative;
          min-height: clamp(110px, 14vh, 160px);
          max-width: 520px;
        }

        .process-copy-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transform: translateY(8px);
          transition:
            opacity 0.5s ease,
            transform 0.5s ease;
          pointer-events: none;
        }

        .process-copy-slide.is-active {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .process-copy-title {
          font-size: clamp(22px, 2.2vw, 32px);
          font-weight: 700;
          color: #084734;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
        }

        .process-copy-body {
          font-size: clamp(15px, 1.1vw, 18px);
          line-height: 1.55;
          color: rgba(8, 71, 52, 0.75);
        }

        @media (max-width: 860px) {
          .process-track {
            height: auto;
          }
          .process-sticky {
            position: static;
            min-height: 0;
            padding: 4rem 0;
          }
          .process-heading {
            transform: none !important;
          }
          .process-heading-word {
            opacity: 1 !important;
          }
          .process-grid {
            grid-template-columns: 1fr;
            gap: 2.25rem;
            opacity: 1 !important;
          }

          /* Numerals on the left, copy on the right — same row */
          .process-right {
            flex-direction: row;
            align-items: center;
            gap: 1.25rem;
          }
          .process-numerals {
            padding-right: 0;
            flex-shrink: 0;
            gap: 0.25rem;
            align-items: flex-start;
          }
          .process-numeral {
            font-size: 72px;
            line-height: 0.95;
            text-align: left;
          }

          /* No scroll-driven arrow on mobile — color contrast indicates active */
          .process-arrow {
            display: none;
          }

          /* Copy flows naturally beside numerals (no absolute stacking) */
          .process-copy {
            flex: 1;
            margin: 0;
            text-align: left;
            min-height: 0;
            max-width: 100%;
            align-self: center;
          }
          .process-copy-slide {
            position: relative;
            inset: auto;
            display: none;
            transform: none;
          }
          .process-copy-slide.is-active {
            display: block;
          }
        }
      `}</style>
    </section>
  );
}
