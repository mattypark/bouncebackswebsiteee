"use client";

import Script from "next/script";

declare global {
  interface Window {
    Tally?: { loadEmbeds: () => void };
  }
}

const EMBED_SRC =
  "https://tally.so/embed/5BRlpd?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1";

// Tally's widget script fills in the iframe src and resizes it to the form's
// height. If the script is blocked, point the iframe at the form directly so
// it still renders at its fixed fallback height.
function loadEmbeds() {
  if (window.Tally) {
    window.Tally.loadEmbeds();
    return;
  }
  document
    .querySelectorAll<HTMLIFrameElement>("iframe[data-tally-src]:not([src])")
    .forEach((frame) => {
      frame.src = frame.dataset.tallySrc ?? "";
    });
}

export default function TallyEmbed() {
  return (
    <>
      <iframe
        data-tally-src={EMBED_SRC}
        loading="lazy"
        width="100%"
        height="900"
        title="BounceBack Ambassador Form"
        className="block w-full border-0"
      />
      <Script
        src="https://tally.so/widgets/embed.js"
        strategy="lazyOnload"
        onReady={loadEmbeds}
        onError={loadEmbeds}
      />
    </>
  );
}
