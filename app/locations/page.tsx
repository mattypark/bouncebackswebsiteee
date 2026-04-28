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
const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

/* ───────────────────────────────────────────── */
/*  Location data                                */
/* ───────────────────────────────────────────── */
interface Location {
  name: string;
  city: string;
  nonprofit: boolean;
  coords: [number, number]; // [lng, lat]
}

interface StateData {
  fips: string;
  abbr: string;
  name: string;
  coords: [number, number];
  zoomLevel: number;
  locations: Location[];
}

const LOCATION_DATA: StateData[] = [
  {
    fips: "12",
    abbr: "FL",
    name: "Florida",
    coords: [-81.5, 28.1],
    zoomLevel: 4,
    locations: [
      { name: "South Sea Island", city: "Captiva", nonprofit: false, coords: [-82.19, 26.53] },
      { name: "Eagle Scout Park", city: "Dunedin", nonprofit: false, coords: [-82.77, 28.02] },
      { name: "Verdana Village", city: "Estero", nonprofit: false, coords: [-81.81, 26.44] },
      { name: "Three Oaks Park", city: "Estero", nonprofit: false, coords: [-81.82, 26.42] },
      { name: "Murano", city: "Estero", nonprofit: false, coords: [-81.80, 26.45] },
      { name: "Shadowwood Preserve", city: "Estero", nonprofit: false, coords: [-81.83, 26.43] },
      { name: "Ace Pickleball Club", city: "Fort Myers", nonprofit: false, coords: [-81.87, 26.64] },
      { name: "Brooks Community Park", city: "Fort Myers", nonprofit: false, coords: [-81.86, 26.60] },
      { name: "DNA Pickleball", city: "Fort Myers", nonprofit: false, coords: [-81.88, 26.62] },
      { name: "The Landings", city: "Fort Myers", nonprofit: false, coords: [-81.85, 26.58] },
      { name: "Bay Oaks Community Center", city: "Fort Myers", nonprofit: false, coords: [-81.94, 26.45] },
      { name: "Plantation Recreation Resort", city: "Lady Lake", nonprofit: true, coords: [-81.93, 28.92] },
      { name: "Dink House Pickleball Club", city: "Largo", nonprofit: false, coords: [-82.79, 27.91] },
      { name: "Ace Pickleball Club", city: "Lutz", nonprofit: false, coords: [-82.46, 28.15] },
      { name: "YMCA Marco Island", city: "Marco Island", nonprofit: false, coords: [-81.73, 25.94] },
      { name: "Naples Pickleball Center", city: "Naples", nonprofit: true, coords: [-81.79, 26.14] },
      { name: "Naples Heritage", city: "Naples", nonprofit: true, coords: [-81.77, 26.12] },
      { name: "Valencia Trails", city: "Naples", nonprofit: true, coords: [-81.75, 26.16] },
      { name: "Veterans Park", city: "Naples", nonprofit: true, coords: [-81.80, 26.18] },
      { name: "Tampa Bay Pickleball Club", city: "Oldsmar", nonprofit: false, coords: [-82.67, 28.03] },
      { name: "PicklePlex", city: "Punta Gorda", nonprofit: false, coords: [-82.05, 26.93] },
      { name: "The Dunes", city: "Sanibel", nonprofit: false, coords: [-82.07, 26.44] },
      { name: "Pickleball Shack SRQ", city: "Sarasota", nonprofit: false, coords: [-82.53, 27.34] },
      { name: "Lakehouse Cove", city: "Sarasota", nonprofit: false, coords: [-82.51, 27.30] },
      { name: "Cresswind Lakewood Ranch", city: "Sarasota", nonprofit: false, coords: [-82.41, 27.38] },
      { name: "MP Tennis & Sports", city: "Tampa", nonprofit: false, coords: [-82.46, 27.95] },
      { name: "Northdale Pickle Lounge", city: "Tampa", nonprofit: false, coords: [-82.51, 28.08] },
      { name: "Tampa Pickleball Crew", city: "Tampa", nonprofit: false, coords: [-82.48, 27.98] },
      { name: "Royal Lakes Country Club", city: "Lakewood Ranch", nonprofit: false, coords: [-82.40, 27.35] },
    ],
  },
  {
    fips: "06",
    abbr: "CA",
    name: "California",
    coords: [-119.4, 36.8],
    zoomLevel: 3.5,
    locations: [
      { name: "Tri Valley Pickleball Club", city: "Livermore", nonprofit: false, coords: [-121.77, 37.68] },
      { name: "Tri Valley Pickleball Club", city: "San Ramon", nonprofit: false, coords: [-121.98, 37.78] },
      { name: "Tri Valley Pickleball Club", city: "Pleasanton", nonprofit: false, coords: [-121.87, 37.66] },
      { name: "Blackhawk Country Club", city: "Danville", nonprofit: false, coords: [-121.93, 37.81] },
      { name: "Paseo Club", city: "Valencia", nonprofit: false, coords: [-118.56, 34.41] },
      { name: "The Best Paddle Compound", city: "Los Angeles", nonprofit: false, coords: [-118.35, 34.05] },
    ],
  },
  {
    fips: "13",
    abbr: "GA",
    name: "Georgia",
    coords: [-83.5, 32.7],
    zoomLevel: 5,
    locations: [
      { name: "Pickleball Clubs (2)", city: "Saint Mary's", nonprofit: true, coords: [-81.55, 30.73] },
      { name: "Wilmington Island", city: "Savannah", nonprofit: true, coords: [-80.97, 32.00] },
      { name: "Lake Mayer", city: "Savannah", nonprofit: true, coords: [-81.06, 32.02] },
      { name: "Tybee YMCA", city: "Tybee Island", nonprofit: true, coords: [-80.85, 32.00] },
    ],
  },
  {
    fips: "47",
    abbr: "TN",
    name: "Tennessee",
    coords: [-86.6, 35.7],
    zoomLevel: 5,
    locations: [
      { name: "The Club at Fairvue Plantation", city: "Gallatin", nonprofit: true, coords: [-86.45, 36.39] },
      { name: "Northfield Church", city: "Gallatin", nonprofit: true, coords: [-86.47, 36.38] },
    ],
  },
  {
    fips: "23",
    abbr: "ME",
    name: "Maine",
    coords: [-69.4, 45.4],
    zoomLevel: 5,
    locations: [
      { name: "The Wicked Pickle", city: "South Portland", nonprofit: true, coords: [-70.28, 43.63] },
      { name: "The Point", city: "South Portland", nonprofit: true, coords: [-70.26, 43.64] },
      { name: "Apex Racket & Fitness", city: "Portland", nonprofit: true, coords: [-70.26, 43.66] },
      { name: "Deering Oaks Park", city: "Portland", nonprofit: true, coords: [-70.27, 43.66] },
      { name: "The Picklr", city: "Westbrook", nonprofit: true, coords: [-70.37, 43.68] },
      { name: "Auburn Public Courts", city: "Auburn", nonprofit: true, coords: [-70.24, 44.10] },
      { name: "Fort Williams Park", city: "Cape Elizabeth", nonprofit: true, coords: [-70.21, 43.62] },
      { name: "Loranger School Courts", city: "Old Orchard Beach", nonprofit: true, coords: [-70.38, 43.52] },
      { name: "Seacoast Pickleball", city: "York", nonprofit: true, coords: [-70.64, 43.16] },
      { name: "Williams Park", city: "Bangor", nonprofit: true, coords: [-68.77, 44.80] },
      { name: "Bounce Pickleball", city: "Biddeford", nonprofit: true, coords: [-70.45, 43.49] },
      { name: "Stearns High School", city: "Millinocket", nonprofit: true, coords: [-68.71, 45.66] },
      { name: "Mattanawcook Jr. High School", city: "Lincoln", nonprofit: true, coords: [-68.51, 45.36] },
      { name: "Messalonskee High School", city: "Oakland", nonprofit: true, coords: [-69.72, 44.54] },
      { name: "South Portland High School", city: "South Portland", nonprofit: true, coords: [-70.30, 43.63] },
      { name: "China Middle School", city: "South China", nonprofit: true, coords: [-69.58, 44.42] },
    ],
  },
  {
    fips: "25",
    abbr: "MA",
    name: "Massachusetts",
    coords: [-71.8, 42.4],
    zoomLevel: 7,
    locations: [
      { name: "Recreation Park @ Pomps Pond", city: "Andover", nonprofit: true, coords: [-71.14, 42.66] },
      { name: "Doherty Gym Courts", city: "Braintree", nonprofit: true, coords: [-71.00, 42.20] },
      { name: "NE Racquet @ Thayer Academy", city: "Braintree", nonprofit: true, coords: [-70.98, 42.21] },
      { name: "Pickles", city: "Hanover", nonprofit: true, coords: [-70.81, 42.11] },
      { name: "Boston Pickle Club", city: "Norwell", nonprofit: true, coords: [-70.79, 42.16] },
      { name: "JCC", city: "Marblehead", nonprofit: true, coords: [-70.86, 42.50] },
      { name: "Seaside Park", city: "Marblehead", nonprofit: true, coords: [-70.85, 42.50] },
      { name: "Veterans Middle School", city: "Marblehead", nonprofit: true, coords: [-70.87, 42.49] },
      { name: "New England Pickleball Club", city: "Middleton", nonprofit: true, coords: [-71.02, 42.60] },
    ],
  },
  {
    fips: "33",
    abbr: "NH",
    name: "New Hampshire",
    coords: [-71.6, 43.8],
    zoomLevel: 6,
    locations: [
      { name: "Foss Field", city: "Wolfeboro", nonprofit: true, coords: [-71.21, 43.58] },
      { name: "Exeter Recreation Park", city: "Exeter", nonprofit: true, coords: [-70.95, 42.98] },
      { name: "Eastman Courts", city: "Grantham", nonprofit: true, coords: [-72.14, 43.49] },
      { name: "Prout Park", city: "Manchester", nonprofit: true, coords: [-71.45, 42.99] },
      { name: "Portsmouth Public Courts", city: "Portsmouth", nonprofit: true, coords: [-70.76, 43.07] },
      { name: "New England Pickleball Club", city: "Rye", nonprofit: true, coords: [-70.77, 43.01] },
      { name: "Pickleball603", city: "East Hampstead", nonprofit: true, coords: [-71.16, 42.87] },
      { name: "Seacoast Pickleball", city: "Newmarket", nonprofit: true, coords: [-70.94, 43.08] },
    ],
  },
  {
    fips: "36",
    abbr: "NY",
    name: "New York",
    coords: [-75.5, 43.0],
    zoomLevel: 4.5,
    locations: [
      { name: "The Pickle Complex", city: "Syosset", nonprofit: false, coords: [-73.50, 40.82] },
    ],
  },
  {
    fips: "19",
    abbr: "IA",
    name: "Iowa",
    coords: [-93.5, 42.0],
    zoomLevel: 5,
    locations: [
      { name: "Polk County Pickleball", city: "Des Moines", nonprofit: false, coords: [-93.6, 41.59] },
    ],
  },
];

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
    <div className="min-h-screen bg-bb-cream text-bb-deep overflow-x-hidden">
      <NavBar variant="dark" />

      {/* ═══ INTERACTIVE MAP WITH SIDE STATS ═══ */}
      <section className="w-full bg-bb-cream pt-28 pb-16 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <Reveal>
            <div className="flex items-center gap-6 lg:gap-10">
              {/* Left stat — Active Bins */}
              <div className="hidden md:flex flex-col items-center justify-center min-w-[100px]">
                <p className="text-4xl font-black text-bb-deep lg:text-5xl">{totalBins}</p>
                <p className="mt-1 text-xs tracking-[0.15em] text-bb-deep/40 uppercase">Active Bins</p>
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

      {/* ═══ LOCATION LIST ═══ */}
      <section className="w-full bg-bb-mint/30 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6 lg:px-16">
          <Reveal>
            <h3 className="text-3xl font-bold text-bb-deep md:text-4xl">
              All Locations
            </h3>
            <p className="mt-3 text-base text-bb-deep/50">
              Locations partnered with non-profit organizations are marked with a star.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...LOCATION_DATA].sort((a, b) => a.name.localeCompare(b.name)).map((state, i) => {
              const allNP = state.locations.every((l) => l.nonprofit);
              const someNP = state.locations.some((l) => l.nonprofit);
              return (
                <Reveal key={state.abbr} delay={0.05 * i}>
                  <div className="h-full rounded-xl border border-bb-deep/8 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-bb-deep">{state.name}</h4>
                      <div className="flex items-center gap-2">
                        {someNP && (
                          <span className="rounded-full bg-bb-lime/20 px-2.5 py-0.5 text-[10px] font-semibold text-bb-deep tracking-wide">
                            {allNP ? "Non-Profit" : "Mixed"}
                          </span>
                        )}
                        <span className="text-xs font-semibold text-bb-deep/40">
                          {state.locations.length} bin{state.locations.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {state.locations.map((loc, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-bb-deep/70">
                          {loc.nonprofit ? (
                            <svg width="12" height="12" viewBox="-6 -6 12 12" className="mt-0.5 shrink-0">
                              <polygon
                                points="0,-5 1.5,-1.5 5.5,-1.5 2.5,1 3.5,5 0,2.5 -3.5,5 -2.5,1 -5.5,-1.5 -1.5,-1.5"
                                fill="#084734"
                              />
                            </svg>
                          ) : (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-bb-deep" />
                          )}
                          <span>
                            {loc.name} <span className="text-bb-deep/40">— {loc.city}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative w-full overflow-hidden">
        <div className="hero-gradient absolute inset-0 opacity-90" />
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-8 py-24 text-center md:py-32">
          <Reveal>
            <h3 className="text-3xl font-bold text-white md:text-5xl lg:text-6xl">
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
                className="bg-bb-lime px-10 py-4 text-sm font-semibold tracking-[0.15em] text-bb-deep transition-all duration-300 hover:bg-white hover:shadow-lg"
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

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-bb-deep/10 bg-bb-cream px-10 py-8 md:px-12 lg:px-16">
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
