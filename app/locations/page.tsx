"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import NavBar from "@/components/NavBar";
import SiteFooter from "@/components/SiteFooter";
import StateExplorer from "@/components/StateExplorer";
import {
  LOCATION_DATA,
  GEO_URL,
  type Location,
  type StateData,
} from "@/lib/locations";

/* ───────────────────────────────────────────── */
/*  Reveal wrapper                               */
/* ───────────────────────────────────────────── */
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

/* ───────────────────────────────────────────── */
/*  TopoJSON URL                                 */
/* ───────────────────────────────────────────── */

/* ───────────────────────────────────────────── */
/*  Location data                                */
/* ───────────────────────────────────────────── */


/* ───────────────────────────────────────────── */
/*  Helpers                                      */
/* ───────────────────────────────────────────── */
function getStateColor(binCount: number): string {
  if (binCount === 0) return "#e5e7eb";
  if (binCount <= 3) return "#c6e6d4";
  if (binCount <= 8) return "#7bc8a4";
  if (binCount <= 16) return "#3a9d6e";
  return "#084734";
}

/* ───────────────────────────────────────────── */
/*  Main Page Component                          */
/* ───────────────────────────────────────────── */
export default function LocationsPage() {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<StateData | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);

  const stateDataByFips = useMemo(() => {
    const m: Record<string, StateData> = {};
    LOCATION_DATA.forEach((s) => { m[s.fips] = s; });
    return m;
  }, []);

  const binCountByFips = useMemo(() => {
    const m: Record<string, number> = {};
    LOCATION_DATA.forEach((s) => { m[s.fips] = s.locations.length; });
    return m;
  }, []);

  const totalBins = LOCATION_DATA.reduce((sum, s) => sum + s.locations.length, 0);
  const totalStates = LOCATION_DATA.length;

  const handleStateClick = useCallback((fips: string) => {
    const state = stateDataByFips[fips];
    if (state) {
      setSelectedState(state);
      setHoveredState(null);
    }
  }, [stateDataByFips]);

  const handleBackClick = useCallback(() => {
    setSelectedState(null);
    setHoveredLocation(null);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-bb-paper text-bb-ink">
      <NavBar variant="dark" />

      {/* ═══ INTERACTIVE MAP WITH SIDE STATS ═══ */}
      <section className="w-full bg-bb-paper pt-28 pb-16 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <Reveal>
            <div className="flex items-center gap-6 lg:gap-10">
              {/* Left stat — Active Bins */}
              <div className="hidden md:flex flex-col items-center justify-center min-w-[100px]">
                <p className="sport-display text-5xl text-bb-ink lg:text-6xl">{totalBins}</p>
                <p className="sport-kicker mt-2 text-bb-mid">Active Bins</p>
              </div>

              {/* Map */}
              <div className="relative flex-1 overflow-hidden rounded-2xl border border-bb-deep/10 bg-white p-4 shadow-sm md:p-8">
                {/* Back button when zoomed */}
                <AnimatePresence>
                  {selectedState && (
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      onClick={handleBackClick}
                      className="absolute top-4 left-4 z-30 flex items-center gap-2 rounded-lg bg-bb-deep px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-bb-deep/90 transition-colors cursor-pointer"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      All States
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* State name overlay when zoomed */}
                <AnimatePresence>
                  {selectedState && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="absolute top-4 right-4 z-30 rounded-lg bg-bb-deep px-5 py-4 shadow-lg"
                    >
                      <p className="text-base font-bold text-bb-lime">{selectedState.name}</p>
                      <p className="text-sm text-bb-cream/80 mt-1">
                        {selectedState.locations.length} bin{selectedState.locations.length > 1 ? "s" : ""} &middot;{" "}
                        {new Set(selectedState.locations.map((l) => l.city)).size} cities
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hovered location tooltip */}
                <AnimatePresence>
                  {hoveredLocation && selectedState && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 rounded-lg bg-bb-deep px-4 py-3 shadow-lg whitespace-nowrap"
                    >
                      <p className="text-sm font-bold text-white">
                        {hoveredLocation.nonprofit && (
                          <span className="text-bb-lime mr-1">★</span>
                        )}
                        {hoveredLocation.name}
                      </p>
                      <p className="text-xs text-bb-cream/60 mt-0.5">
                        {hoveredLocation.city}
                        {hoveredLocation.nonprofit && " · Non-Profit Partner"}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {!selectedState ? (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <ComposableMap
                        projection="geoAlbersUsa"
                        projectionConfig={{ scale: 1000 }}
                        width={960}
                        height={600}
                        style={{ width: "100%", height: "auto" }}
                      >
                        <Geographies geography={GEO_URL}>
                          {({ geographies }) =>
                            geographies.map((geo) => {
                              const fips = geo.id;
                              const binCount = binCountByFips[fips] || 0;
                              const isHovered = hoveredState === fips;

                              return (
                                <Geography
                                  key={geo.rsmKey}
                                  geography={geo}
                                  fill={isHovered && binCount > 0 ? "#65BE44" : getStateColor(binCount)}
                                  stroke="#fff"
                                  strokeWidth={0.75}
                                  onMouseEnter={() => { if (binCount > 0) setHoveredState(fips); }}
                                  onMouseLeave={() => setHoveredState(null)}
                                  onClick={() => { if (binCount > 0) handleStateClick(fips); }}
                                  style={{
                                    default: { outline: "none", transition: "fill 0.3s ease" },
                                    hover: { outline: "none", cursor: binCount > 0 ? "pointer" : "default" },
                                    pressed: { outline: "none" },
                                  }}
                                />
                              );
                            })
                          }
                        </Geographies>

                        {LOCATION_DATA.map((state) => {
                          const hasNP = state.locations.some((l) => l.nonprofit);
                          const hasRegular = state.locations.some((l) => !l.nonprofit);
                          return (
                            <Marker key={state.abbr} coordinates={state.coords}>
                              {hasRegular && (
                                <circle
                                  r={4}
                                  fill="#084734"
                                  stroke="#fff"
                                  strokeWidth={1.5}
                                  cx={hasNP ? -7 : 0}
                                />
                              )}
                              {hasNP && (
                                <polygon
                                  points="0,-5 1.5,-1.5 5.5,-1.5 2.5,1 3.5,5 0,2.5 -3.5,5 -2.5,1 -5.5,-1.5 -1.5,-1.5"
                                  fill="#084734"
                                  stroke="#fff"
                                  strokeWidth={0.8}
                                  transform={`translate(${hasRegular ? 7 : 0}, 0)`}
                                />
                              )}
                              <text
                                textAnchor="middle"
                                y={14}
                                style={{
                                  fontFamily: "system-ui, sans-serif",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  fill: "#084734",
                                }}
                              >
                                {state.abbr}
                              </text>
                            </Marker>
                          );
                        })}
                      </ComposableMap>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`zoomed-${selectedState.fips}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{
                          center: selectedState.coords,
                          scale: selectedState.zoomLevel * 1000,
                        }}
                        width={960}
                        height={600}
                        style={{ width: "100%", height: "auto" }}
                      >
                        <Geographies geography={GEO_URL}>
                          {({ geographies }) =>
                            geographies.map((geo) => {
                              const fips = geo.id;
                              const isSelected = selectedState.fips === fips;

                              return (
                                <Geography
                                  key={geo.rsmKey}
                                  geography={geo}
                                  fill={isSelected ? "#c6e6d4" : "#f3f4f6"}
                                  stroke="#fff"
                                  strokeWidth={0.5}
                                  style={{
                                    default: { outline: "none" },
                                    hover: { outline: "none" },
                                    pressed: { outline: "none" },
                                  }}
                                />
                              );
                            })
                          }
                        </Geographies>

                        {selectedState.locations.map((loc, i) => (
                          <Marker key={`loc-${i}`} coordinates={loc.coords}>
                            {loc.nonprofit ? (
                              <g
                                onMouseEnter={() => setHoveredLocation(loc)}
                                onMouseLeave={() => setHoveredLocation(null)}
                                style={{ cursor: "pointer" }}
                              >
                                <polygon
                                  points="0,-8 2.4,-2.4 8.8,-2.4 4,1.6 5.6,8 0,4 -5.6,8 -4,1.6 -8.8,-2.4 -2.4,-2.4"
                                  fill="#084734"
                                  stroke="#fff"
                                  strokeWidth={1.5}
                                />
                              </g>
                            ) : (
                              <g
                                onMouseEnter={() => setHoveredLocation(loc)}
                                onMouseLeave={() => setHoveredLocation(null)}
                                style={{ cursor: "pointer" }}
                              >
                                <circle
                                  r={6}
                                  fill="#65BE44"
                                  stroke="#fff"
                                  strokeWidth={2}
                                />
                              </g>
                            )}
                          </Marker>
                        ))}
                      </ComposableMap>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tooltip when NOT zoomed */}
                {!selectedState && hoveredState && stateDataByFips[hoveredState] && (
                  <div className="absolute top-4 right-4 rounded-lg bg-bb-deep px-5 py-4 shadow-lg z-20">
                    <p className="text-base font-bold text-bb-lime">
                      {stateDataByFips[hoveredState].name}
                    </p>
                    <p className="text-sm text-bb-cream/80 mt-1">
                      {stateDataByFips[hoveredState].locations.length} bin
                      {stateDataByFips[hoveredState].locations.length > 1 ? "s" : ""} &middot;{" "}
                      {new Set(stateDataByFips[hoveredState].locations.map((l) => l.city)).size} cities
                    </p>
                    {stateDataByFips[hoveredState].locations.some((l) => l.nonprofit) && (
                      <p className="mt-1 text-xs text-bb-lime/70">
                        Non-Profit Partner
                      </p>
                    )}
                    <p className="mt-2 text-[10px] text-bb-cream/40">Click to explore</p>
                  </div>
                )}
              </div>

              {/* Right stat — States */}
              <div className="hidden md:flex flex-col items-center justify-center min-w-[100px]">
                <p className="text-4xl font-black text-bb-deep lg:text-5xl">{totalStates}</p>
                <p className="mt-1 text-xs tracking-[0.15em] text-bb-deep/40 uppercase">States</p>
              </div>
            </div>

            {/* Mobile stats — visible below map on small screens */}
            <div className="mt-6 flex justify-center gap-12 md:hidden">
              <div className="text-center">
                <p className="text-3xl font-black text-bb-deep">{totalBins}</p>
                <p className="mt-1 text-xs tracking-[0.15em] text-bb-deep/40 uppercase">Active Bins</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-bb-deep">{totalStates}</p>
                <p className="mt-1 text-xs tracking-[0.15em] text-bb-deep/40 uppercase">States</p>
              </div>
            </div>
          </Reveal>

          {/* Legend */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-bb-deep/60">
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-[#65BE44]" />
              <span>BounceBack Bin</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="-6 -6 12 12">
                <polygon
                  points="0,-5 1.5,-1.5 5.5,-1.5 2.5,1 3.5,5 0,2.5 -3.5,5 -2.5,1 -5.5,-1.5 -1.5,-1.5"
                  fill="#084734"
                />
              </svg>
              <span>Non-Profit Partner</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {["#c6e6d4", "#7bc8a4", "#3a9d6e", "#084734"].map((c) => (
                  <span key={c} className="inline-block h-3 w-6 rounded-sm" style={{ backgroundColor: c }} />
                ))}
              </div>
              <span>More bins = darker</span>
            </div>
          </div>
        </div>
      </section>

      <StateExplorer />

      {/* ═══ CTA ═══ */}
      <section className="relative w-full overflow-hidden">
        <div className="hero-gradient-sport absolute inset-0" />
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-8 py-24 text-center md:py-32">
          <Reveal>
            <h3 className="sport-display text-4xl text-white md:text-6xl">
              Want a bin at your facility?
            </h3>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/70 md:text-lg">
              We partner with pickleball courts, recreation centers, and clubs
              across the country. Request a BounceBack recycling bin for your
              location and join the movement.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="/request-bin"
                className="bg-bb-volt px-10 py-4 text-sm font-black tracking-[0.18em] text-bb-ink uppercase transition-colors duration-300 hover:bg-white"
              >
                REQUEST A BIN
              </a>
              <a
                href="/#waitlist"
                className="border-2 border-white/40 px-10 py-4 text-sm font-semibold tracking-[0.15em] text-white transition-all duration-300 hover:border-white hover:bg-white/10"
              >
                JOIN THE WAITLIST
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />

    </div>
  );
}
