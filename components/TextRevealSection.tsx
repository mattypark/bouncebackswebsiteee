"use client";

import { useEffect, useRef } from "react";

/*
  TextFluxUnveil-style scroll text reveal
  Each word fades from low opacity to full as the section scrolls through the viewport.
  Words reveal sequentially based on scroll progress through the section.
*/

function TextRevealSection({
  text,
  id,
  className,
}: {
  text: string;
  id?: string;
  className?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    function onScroll() {
      const rect = section!.getBoundingClientRect();
      const windowH = window.innerHeight;

      // start = section center position (from top) when reveal BEGINS (higher = earlier)
      // end   = section center position (from top) when reveal is DONE (lower = earlier finish)
      // Reveal starts as section enters viewport, finishes when centered
      const start = windowH * 1.0;  // begin as soon as section center enters bottom of screen
      const end = windowH * 0.6;    // fully revealed when section is centered
      const sectionCenter = rect.top + rect.height / 2;
      const progress = 1 - (sectionCenter - end) / (start - end);
      const clampedProgress = Math.max(0, Math.min(1, progress));

      const words = wordsRef.current;
      const totalWords = words.length;

      words.forEach((word, i) => {
        if (!word) return;
        // Each word has its own threshold within the progress
        const wordStart = i / totalWords;
        const wordEnd = (i + 1) / totalWords;
        const wordProgress = (clampedProgress - wordStart) / (wordEnd - wordStart);
        const clampedWordProgress = Math.max(0, Math.min(1, wordProgress));

        // Opacity: from 0.15 to 1
        const opacity = 0.15 + clampedWordProgress * 0.85;
        word.style.opacity = String(opacity);
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // run once on mount

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const words = text.split(" ");

  return (
    <section
      ref={sectionRef}
      id={id}
      className={className || "flex w-full items-center justify-center py-24 md:py-32"}
      style={
        className
          ? undefined
          : { background: "linear-gradient(180deg, #FBFFF1 0%, #CEF17B 55%, #CEF17B 100%)" }
      }
    >
      <div className="mx-auto max-w-4xl px-8 md:px-14 lg:px-20">
        <p className="text-center text-3xl font-bold leading-snug text-bb-deep md:text-4xl lg:text-5xl">
          {words.map((word, i) => (
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
    </section>
  );
}

export default TextRevealSection;
