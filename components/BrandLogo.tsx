/*
  BOUNCEBACK PICKLE — PERFORMANCE lockup.
  Mirrors the printed box/logo: bold+light wordmark, PICKLE seated inside
  angled slash chevrons, PERFORMANCE letterspaced underneath.
*/

interface BrandLogoProps {
  /** Overall scale — base is roughly nav-sized */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: { word: "text-lg", pickle: "text-[9px]", perf: "text-[6px]", chevron: 44 },
  md: { word: "text-2xl", pickle: "text-[11px]", perf: "text-[7px]", chevron: 60 },
  lg: { word: "text-5xl", pickle: "text-lg", perf: "text-xs", chevron: 120 },
} as const;

export default function BrandLogo({ size = "md", className = "" }: BrandLogoProps) {
  const s = SIZES[size];

  return (
    <span className={`inline-flex flex-col items-center leading-none ${className}`}>
      <span className={`${s.word} tracking-tight`}>
        <span className="font-black">BOUNCE</span>
        <span className="font-light">BACK</span>
      </span>

      {/* PICKLE inside slash chevrons */}
      <span className="mt-[2px] flex items-center gap-[6px]">
        <svg
          width={s.chevron * 0.28}
          height={s.chevron * 0.14}
          viewBox="0 0 28 14"
          fill="currentColor"
          aria-hidden
        >
          <polygon points="10,0 16,0 6,14 0,14" />
          <polygon points="20,0 26,0 16,14 10,14" />
        </svg>
        <span className={`${s.pickle} font-bold tracking-[0.45em]`}>PICKLE</span>
        <svg
          width={s.chevron * 0.28}
          height={s.chevron * 0.14}
          viewBox="0 0 28 14"
          fill="currentColor"
          aria-hidden
        >
          <polygon points="12,0 18,0 8,14 2,14" />
          <polygon points="22,0 28,0 18,14 12,14" />
        </svg>
      </span>

      <span className={`${s.perf} mt-[3px] font-semibold tracking-[0.5em]`}>
        PERFORMANCE
      </span>
    </span>
  );
}
