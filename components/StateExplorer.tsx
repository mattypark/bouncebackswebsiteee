"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { LOCATION_DATA, GEO_URL, TOTAL_BINS, type StateData } from "@/lib/locations";

/*
  State explorer — replaces the old wall of state cards.

  A drag-scrollable rail of state tiles runs across the top (same grab-and-
  throw feel as the process carousel). Stop on one, click it, and the panel
  below shows that state on the map with a pin per facility, the bin count,
  and every facility grouped by city.
*/

// Sorted by footprint so the biggest networks lead the rail
const STATES = [...LOCATION_DATA].sort(
  (a, b) => b.locations.length - a.locations.length
);

function binLabel(n: number) {
  return `${n} bin${n === 1 ? "" : "s"}`;
}

function StateTile({
  state,
  isActive,
  onSelect,
}: {
  state: StateData;
  isActive: boolean;
  onSelect: () => void;
}) {
  const nonprofits = state.locations.filter((l) => l.nonprofit).length;

  return (
    <button
      onClick={onSelect}
      aria-pressed={isActive}
      className={`relative w-[150px] shrink-0 rounded-2xl border p-5 text-left transition-all md:w-[168px] ${
        isActive
          ? "border-bb-ink bg-bb-ink shadow-[0_18px_40px_-16px_rgba(8,71,52,0.6)]"
          : "border-black/10 bg-bb-paper hover:border-bb-ink/40 hover:shadow-md"
      }`}
    >
      <p
        className={`sport-display text-5xl ${isActive ? "text-bb-volt" : "text-bb-ink"}`}
      >
        {state.abbr}
      </p>
      <p
        className={`mt-2 truncate text-[11px] font-black tracking-[0.1em] uppercase ${
          isActive ? "text-white/70" : "text-bb-ink/50"
        }`}
      >
        {state.name}
      </p>
      <p
        className={`mt-3 text-xs font-bold ${isActive ? "text-white" : "text-bb-mid"}`}
      >
        {binLabel(state.locations.length)}
      </p>

      {nonprofits > 0 && (
        <span
          className={`absolute top-4 right-4 text-sm ${
            isActive ? "text-bb-volt" : "text-bb-mid"
          }`}
          title={`${nonprofits} non-profit ${nonprofits === 1 ? "partner" : "partners"}`}
        >
          ★
        </span>
      )}
    </button>
  );
}

export default function StateExplorer() {
  const [activeAbbr, setActiveAbbr] = useState(STATES[0].abbr);
  const railRef = useRef<HTMLDivElement>(null);

  const active = useMemo(
    () => STATES.find((s) => s.abbr === activeAbbr) ?? STATES[0],
    [activeAbbr]
  );

  // Facilities grouped by city, cities alphabetical
  const byCity = useMemo(() => {
    const map = new Map<string, typeof active.locations>();
    for (const loc of active.locations) {
      const list = map.get(loc.city) ?? [];
      list.push(loc);
      map.set(loc.city, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [active]);

  const nonprofitCount = active.locations.filter((l) => l.nonprofit).length;

  return (
    <section className="w-full bg-bb-court py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-16">
        {/* Heading */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="sport-kicker text-bb-mid">The Bin Network</p>
            <h2 className="sport-display mt-4 text-4xl text-bb-ink md:text-6xl">
              All Locations
            </h2>
          </div>
          <div className="text-right">
            <p className="sport-display text-4xl text-bb-ink md:text-5xl">{TOTAL_BINS}</p>
            <p className="sport-kicker mt-1 text-bb-mid">
              Bins · {STATES.length} States
            </p>
          </div>
        </div>

        {/* ── Drag-scrollable state rail ── */}
        <div className="relative mt-10">
          <div
            ref={railRef}
            className="scrollbar-none -mx-6 flex cursor-grab gap-3 overflow-x-auto px-6 pb-4 active:cursor-grabbing lg:-mx-16 lg:px-16"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {STATES.map((state) => (
              <div key={state.abbr} style={{ scrollSnapAlign: "start" }}>
                <StateTile
                  state={state}
                  isActive={state.abbr === active.abbr}
                  onSelect={() => setActiveAbbr(state.abbr)}
                />
              </div>
            ))}
          </div>

          {/* Edge fade so the rail reads as scrollable */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-bb-court to-transparent"
            aria-hidden
          />
        </div>

        <p className="mt-1 text-[11px] font-bold tracking-[0.16em] text-bb-ink/35 uppercase">
          Scroll the states · tap one to see its bins
        </p>

        {/* ── Selected state panel ── */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* Map */}
          <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-bb-paper p-4 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.abbr}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{
                    center: active.coords,
                    scale: active.zoomLevel * 1000,
                  }}
                  width={720}
                  height={520}
                  style={{ width: "100%", height: "auto" }}
                >
                  <Geographies geography={GEO_URL}>
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={geo.id === active.fips ? "#c6e6d4" : "#ececeb"}
                          stroke="#fff"
                          strokeWidth={0.6}
                          style={{
                            default: { outline: "none" },
                            hover: { outline: "none" },
                            pressed: { outline: "none" },
                          }}
                        />
                      ))
                    }
                  </Geographies>

                  {active.locations.map((loc, i) => (
                    <Marker key={`${loc.name}-${i}`} coordinates={loc.coords}>
                      {loc.nonprofit ? (
                        <polygon
                          points="0,-8 2.4,-2.4 8.8,-2.4 4,1.6 5.6,8 0,4 -5.6,8 -4,1.6 -8.8,-2.4 -2.4,-2.4"
                          fill="#084734"
                          stroke="#fff"
                          strokeWidth={1.5}
                        />
                      ) : (
                        <circle r={6} fill="#65BE44" stroke="#fff" strokeWidth={2} />
                      )}
                    </Marker>
                  ))}
                </ComposableMap>
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-5 left-5 flex items-center gap-4 rounded-xl bg-bb-ink/90 px-4 py-3 backdrop-blur">
              <span className="flex items-center gap-2 text-[10px] font-black tracking-[0.1em] text-white/80 uppercase">
                <span className="h-2.5 w-2.5 rounded-full bg-[#65BE44]" /> Bin
              </span>
              <span className="flex items-center gap-2 text-[10px] font-black tracking-[0.1em] text-white/80 uppercase">
                <span className="text-bb-volt">★</span> Non-profit
              </span>
            </div>
          </div>

          {/* Facilities */}
          <div className="rounded-2xl border border-black/10 bg-bb-paper p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.abbr}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="sport-kicker text-bb-mid">{active.abbr}</p>
                    <h3 className="sport-display mt-2 text-4xl text-bb-ink md:text-5xl">
                      {active.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="sport-display text-5xl text-bb-ink">
                      {active.locations.length}
                    </p>
                    <p className="sport-kicker mt-1 text-bb-mid">Bins</p>
                  </div>
                </div>

                {nonprofitCount > 0 && (
                  <span className="mt-4 inline-block rounded-full bg-bb-volt px-3 py-1 text-[10px] font-black tracking-[0.1em] text-bb-ink uppercase">
                    {nonprofitCount} non-profit{" "}
                    {nonprofitCount === 1 ? "partner" : "partners"}
                  </span>
                )}

                <div className="mt-6 max-h-[380px] space-y-5 overflow-y-auto pr-2">
                  {byCity.map(([city, locs]) => (
                    <div key={city}>
                      <div className="flex items-baseline justify-between border-b border-black/10 pb-2">
                        <p className="text-xs font-black tracking-[0.12em] text-bb-ink uppercase">
                          {city}
                        </p>
                        <p className="text-[11px] font-bold text-bb-ink/40">
                          {binLabel(locs.length)}
                        </p>
                      </div>
                      <ul className="mt-3 space-y-2">
                        {locs.map((loc, i) => (
                          <li
                            key={`${loc.name}-${i}`}
                            className="flex items-start gap-2 text-sm text-bb-ink/75"
                          >
                            {loc.nonprofit ? (
                              <span className="mt-[1px] shrink-0 text-bb-mid">★</span>
                            ) : (
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-bb-mid" />
                            )}
                            <span>{loc.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
