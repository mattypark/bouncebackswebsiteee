"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  PACKS,
  SHOP_DOMAIN,
  type Pack,
  type PackOption,
  type PurchaseType,
} from "@/lib/shopify-products";

/*
  BB-1 buy page.

  Land here from any BUY BB-1 entry point, flip Subscribe/One-time, pick a
  pack, then hit BUY NOW. Selecting a pack only selects it — the single BUY
  NOW button is the one thing that leaves for Shopify checkout, so there is
  never a hidden "clicking this charges me" tile.

  LEFT   — gallery
  RIGHT  — social proof → title → purchase toggle → price → pack picker →
           BUY NOW → spec
  BOTTOM — subscriber club card, full width
*/

const BENEFITS = [
  {
    title: "100% Recycled Materials",
    body: "Every ball starts as one collected through our nationwide bin network.",
  },
  {
    title: "40 Precision Drilled Holes",
    body: "Consistent flight and wind resistance, drilled to spec.",
  },
  {
    title: "Pro-Approved Spec",
    body: "USAPA bounce and durability matching the pros.",
  },
  {
    title: "Closed-Loop Program",
    body: "Crack one? Send it back — it becomes the next ball.",
  },
];

const CLUB_PERKS = [
  { bold: "Free shipping", rest: "on 36 & 100 packs" },
  { bold: "Cancel, pause, or skip", rest: "anytime" },
  { bold: "Swap pack sizes", rest: "between deliveries" },
  { bold: "Early access", rest: "to new gear and drops" },
];

const CLUB_REWARDS = [
  { count: "01", title: "FREE Sticker Pack", sub: "after 1 order", value: "$5" },
  { count: "03", title: "FREE 3-Pack of BB-1s", sub: "after 3 orders", value: "$13" },
  { count: "05", title: "FREE Swag Pack", sub: "tee + hat · after 5 orders", value: "$48" },
];

const PACK_NOTES: Record<Pack, { note: string; badge?: string }> = {
  "3": { note: "Casual play. Try BB-1 out." },
  "12": { note: "2-3 sessions a week.", badge: "Most Popular" },
  "36": { note: "Clubs & coaches. Free shipping." },
  "100": { note: "Facilities. Best value per ball.", badge: "Best Value" },
};

const BEST_FOR: Record<Pack, string> = {
  "3": "Trying BB-1 out, casual weekend games.",
  "12": "Weekly players who go through balls fast.",
  "36": "Clubs, coaches, and league nights.",
  "100": "Facilities stocking every court.",
};

/*
  Direct checkout link. /cart/clear first so a stale Shopify cart can't stack
  extra packs onto the order, then /cart/add — the add path is the one that
  honors selling_plan (the older {variant}:{qty} permalink drops it).
*/
function buyUrl(option: PackOption, isSub: boolean): string {
  const params = new URLSearchParams({
    id: isSub ? option.subscription.variantId : option.onetime.variantId,
    quantity: "1",
  });
  if (isSub) params.set("selling_plan", option.subscription.sellingPlanId);
  params.set("return_to", "/checkout");

  return `https://${SHOP_DOMAIN}/cart/clear?return_to=${encodeURIComponent(
    `/cart/add?${params.toString()}`
  )}`;
}

function Check({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`mt-[2px] flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
        dark ? "bg-bb-deep" : "bg-bb-mid/15"
      }`}
    >
      <svg width="11" height="9" viewBox="0 0 14 11" fill="none" aria-hidden>
        <path
          d="M1 5.5L5 9.5L13 1.5"
          stroke={dark ? "#c6f000" : "#084734"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function ProductDetail({ pack }: { pack: Pack }) {
  // The route sets the starting pack; the picker below can change it without
  // navigating, so the buy button always reflects what is highlighted.
  const [selectedPack, setSelectedPack] = useState<Pack>(pack);
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("subscription");
  const [galleryIdx, setGalleryIdx] = useState(0);

  const current = PACKS.find((p) => p.pack === selectedPack) ?? PACKS[0];
  const isSub = purchaseType === "subscription";
  const price = isSub ? current.subscription.price : current.onetime.price;
  const savings = (current.onetime.price - current.subscription.price).toFixed(2);

  // Gallery: this pack first, then the ball shot, then the other packs
  const gallery = [
    { src: current.image, alt: `BB-1 ${current.label}` },
    { src: "/bb1-ball.png", alt: "BB-1 ball close-up" },
    ...PACKS.filter((p) => p.pack !== current.pack).map((p) => ({
      src: p.image,
      alt: `BB-1 ${p.label}`,
    })),
  ];

  function selectPack(next: Pack) {
    setSelectedPack(next);
    setGalleryIdx(0); // jump the gallery back to the pack you just picked
  }

  return (
    <section className="w-full bg-bb-paper pt-10 pb-24 md:pt-16 md:pb-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* ══════════ LEFT — gallery ══════════ */}
          <div>
            <motion.div
              className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-bb-court"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src={gallery[galleryIdx].src}
                alt={gallery[galleryIdx].alt}
                width={720}
                height={720}
                priority
                className="h-auto w-[85%]"
              />
            </motion.div>

            {/* Thumbnail row */}
            <div className="mt-4 grid grid-cols-6 gap-2">
              {gallery.slice(0, 6).map((g, i) => (
                <button
                  key={g.alt + i}
                  onClick={() => setGalleryIdx(i)}
                  aria-label={`View ${g.alt}`}
                  className={`flex aspect-square items-center justify-center rounded-lg bg-bb-court transition-all ${
                    i === galleryIdx ? "ring-2 ring-bb-deep" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={g.src} alt={g.alt} width={100} height={100} className="h-auto w-[80%]" />
                </button>
              ))}
            </div>
          </div>

          {/* ══════════ RIGHT — buy column ══════════ */}
          <div>
            {/* Social proof */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold tracking-[0.1em] text-bb-deep">★★★★★ 5.0</span>
              <span className="text-xs font-bold tracking-[0.12em] text-bb-deep/50 uppercase">
                · 10,000+ balls recycled
              </span>
            </div>

            <h1 className="sport-display mt-3 text-[2.6rem] text-bb-deep sm:text-6xl md:text-7xl">
              BB-1 {current.label}
            </h1>
            <p className="mt-2 text-sm text-bb-deep/50 md:text-base">
              {current.count} Balls · Outdoor · USAPA Spec · 100% Recycled
            </p>

            <p className="mt-5 max-w-md text-sm leading-relaxed text-bb-deep/75 md:text-base">
              Same feel and same bounce as professional-grade balls, made entirely from
              recycled pickleballs.{" "}
              <span className="font-bold text-bb-deep">Best for:</span> {BEST_FOR[current.pack]}
            </p>

            {/* Purchase type toggle */}
            <div className="mt-8 grid grid-cols-2 overflow-hidden rounded-lg border border-black/15">
              <button
                onClick={() => setPurchaseType("subscription")}
                className={`py-4 text-sm font-bold transition-colors ${
                  isSub ? "bg-bb-deep text-white" : "bg-white text-bb-deep/60 hover:text-bb-deep"
                }`}
              >
                Subscribe &amp; Save
              </button>
              <button
                onClick={() => setPurchaseType("onetime")}
                className={`py-4 text-sm font-bold transition-colors ${
                  !isSub ? "bg-bb-deep text-white" : "bg-white text-bb-deep/60 hover:text-bb-deep"
                }`}
              >
                One-Time
              </button>
            </div>

            {/* Price line for the selected pack */}
            <div className="mt-4 flex items-baseline justify-between rounded-xl border border-bb-mid/60 bg-white px-6 py-5">
              <div>
                <p className="text-4xl font-black text-bb-deep">${price.toFixed(2)}</p>
                <p className="mt-1 text-xs text-bb-deep/50">
                  {isSub ? "Delivered monthly · " : ""}
                  {current.shippingNote}
                </p>
              </div>
              {isSub && (
                <span className="rounded-full bg-bb-volt px-3 py-1.5 text-[11px] font-black tracking-[0.12em] text-bb-deep uppercase">
                  Save ${savings} / order
                </span>
              )}
            </div>

            {/* ── Pack picker — selecting only selects ── */}
            <div className="mt-8 flex items-baseline justify-between">
              <p className="text-sm font-bold text-bb-deep">Pick your pack</p>
              <p className="text-xs font-semibold text-bb-mid">
                {current.label} selected
              </p>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {PACKS.map((p) => {
                const isCurrent = p.pack === current.pack;
                const tilePrice = isSub ? p.subscription.price : p.onetime.price;
                const badge = PACK_NOTES[p.pack].badge;

                return (
                  <button
                    key={p.pack}
                    type="button"
                    onClick={() => selectPack(p.pack)}
                    aria-pressed={isCurrent}
                    className={`relative flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                      isCurrent
                        ? "border-bb-deep bg-white ring-2 ring-bb-deep"
                        : "border-black/15 bg-white hover:border-bb-deep hover:shadow-md"
                    }`}
                  >
                    {badge && (
                      <span className="absolute -top-2.5 right-4 rounded bg-bb-volt px-2 py-0.5 text-[9px] font-black tracking-[0.12em] text-bb-deep uppercase">
                        {badge}
                      </span>
                    )}

                    <div className="min-w-0">
                      <p className="text-sm font-black text-bb-deep">{p.label}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-bb-deep/50">
                        {PACK_NOTES[p.pack].note}
                      </p>
                    </div>

                    <div className="ml-4 flex shrink-0 items-center gap-3">
                      <p className="text-lg font-black text-bb-deep">${tilePrice.toFixed(2)}</p>
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                          isCurrent ? "border-bb-deep bg-bb-deep" : "border-black/20"
                        }`}
                        aria-hidden
                      >
                        {isCurrent && (
                          <svg width="10" height="8" viewBox="0 0 14 11" fill="none">
                            <path
                              d="M1 5.5L5 9.5L13 1.5"
                              stroke="#c6f000"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ── The one thing that leaves for checkout ── */}
            <a
              href={buyUrl(current, isSub)}
              className="mt-6 flex w-full items-center justify-center gap-3 bg-bb-deep px-10 py-5 text-sm font-black tracking-[0.2em] text-bb-volt uppercase transition-colors duration-200 hover:bg-bb-volt hover:text-bb-deep"
            >
              Buy Now · {current.label} · ${price.toFixed(2)}
              <span aria-hidden>→</span>
            </a>

            <p className="mt-3 text-xs text-bb-deep/50">
              Most players go through about 12 balls a month. Secure checkout via Shopify —
              skip, swap, or cancel a subscription anytime.
            </p>

            {/* Benefit tiles */}
            <div id="spec" className="mt-8 grid gap-3 sm:grid-cols-2">
              {BENEFITS.map((b) => (
                <div
                  key={b.title}
                  className="flex gap-3 rounded-xl border border-black/10 bg-white p-4"
                >
                  <Check dark />
                  <div>
                    <p className="text-xs font-black tracking-wide text-bb-deep uppercase">
                      {b.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-bb-deep/60">{b.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════ BOTTOM — subscriber club ══════════ */}
        <div className="mt-16 rounded-2xl border border-bb-mid/40 bg-white p-6 md:mt-20 md:p-10">
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <p className="sport-kicker text-bb-mid">Subscriber Exclusive</p>
              <p className="sport-display mt-2 text-3xl text-bb-deep md:text-4xl">
                Join the Bounce Club
              </p>
              <p className="mt-4 border-b border-dashed border-black/15 pb-4 text-sm text-bb-deep/70">
                Over <span className="font-bold text-bb-deep">$65 in free gear</span> unlocks
                as you play. Free gear at 1, 3, and 5 orders.
              </p>

              <ul className="mt-4 space-y-3">
                {CLUB_PERKS.map((perk) => (
                  <li key={perk.bold} className="flex items-center gap-3 text-sm text-bb-deep/80">
                    <Check />
                    <span>
                      <span className="font-bold text-bb-deep">{perk.bold}</span> {perk.rest}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="sport-kicker text-bb-mid">Play more, win more</p>
                <p className="sport-kicker text-bb-deep/50">$65+ in free gear</p>
              </div>

              <div className="mt-3 space-y-2">
                {CLUB_REWARDS.map((r) => (
                  <div
                    key={r.count}
                    className="flex items-center gap-4 rounded-xl border border-black/10 bg-bb-paper p-4"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bb-deep text-sm font-black text-bb-volt">
                      {r.count}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-bb-deep">{r.title}</p>
                      <p className="text-xs text-bb-deep/50">{r.sub}</p>
                    </div>
                    <span className="text-sm font-black text-bb-mid">{r.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-bb-deep px-5 py-4">
                <p className="text-xs font-black tracking-[0.18em] text-white uppercase">
                  Total Member Value
                </p>
                <p className="text-lg font-black text-bb-volt">$65+</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
