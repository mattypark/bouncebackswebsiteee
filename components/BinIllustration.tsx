import type { CSSProperties } from "react";

/*
  BinIllustration — clean SVG illustration of a BounceBack pickleball
  recycling bin. Used as the hero focal point now that the bin (orderable
  today) is the primary product, with the BB-1 ball as the eventual output.
*/

export default function BinIllustration({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 500 640"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      aria-label="BounceBack pickleball recycling bin"
      role="img"
    >
      {/* Ground shadow */}
      <ellipse cx="250" cy="618" rx="205" ry="14" fill="rgba(0,0,0,0.35)" />

      {/* A pickleball falling in from above (right-side, slight tilt) */}
      <g transform="translate(310, 70) rotate(18)">
        <circle r="34" fill="#CEF17B" stroke="#062818" strokeWidth="2.5" />
        <circle cx="-11" cy="-10" r="3.5" fill="#062818" />
        <circle cx="9" cy="-14" r="3.5" fill="#062818" />
        <circle cx="15" cy="3" r="3.5" fill="#062818" />
        <circle cx="-14" cy="7" r="3.5" fill="#062818" />
        <circle cx="2" cy="14" r="3.5" fill="#062818" />
      </g>

      {/* Bin body — trapezoidal with subtle taper, rounded corners */}
      <path
        d="M 90 200 Q 80 200 84 222 L 120 600 Q 122 622 142 622 L 358 622 Q 378 622 380 600 L 416 222 Q 420 200 410 200 Z"
        fill="#062818"
      />

      {/* Subtle inner-left highlight */}
      <path
        d="M 132 250 L 152 590"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Bin rim — lime band wrapping the top */}
      <path
        d="M 78 192 Q 78 168 102 168 L 398 168 Q 422 168 422 192 L 416 222 L 84 222 Z"
        fill="#CEF17B"
      />

      {/* Bin opening — dark recess showing the inside */}
      <ellipse cx="250" cy="190" rx="160" ry="22" fill="#01110a" />

      {/* Two pickleballs visible inside the bin, peeking over the rim */}
      <g>
        <circle cx="198" cy="186" r="28" fill="#CEF17B" stroke="#062818" strokeWidth="2" />
        <circle cx="189" cy="176" r="2.8" fill="#062818" />
        <circle cx="206" cy="174" r="2.8" fill="#062818" />
        <circle cx="198" cy="192" r="2.8" fill="#062818" />

        <circle cx="298" cy="188" r="30" fill="#CEF17B" stroke="#062818" strokeWidth="2" />
        <circle cx="288" cy="178" r="2.8" fill="#062818" />
        <circle cx="309" cy="177" r="2.8" fill="#062818" />
        <circle cx="298" cy="197" r="2.8" fill="#062818" />
      </g>

      {/* BB wordmark on bin front */}
      <text
        x="250"
        y="420"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, 'Helvetica Neue', sans-serif"
        fontWeight="900"
        fontSize="100"
        fill="#CEF17B"
        letterSpacing="-4"
      >
        BB
      </text>

      {/* RECYCLE tag below the wordmark */}
      <text
        x="250"
        y="460"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, 'Helvetica Neue', sans-serif"
        fontWeight="700"
        fontSize="14"
        fill="#CEF17B"
        letterSpacing="4"
      >
        RECYCLE
      </text>
    </svg>
  );
}
