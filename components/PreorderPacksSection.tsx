"use client";

import { useState } from "react";
import Image from "next/image";
import { PACKS, type PackOption, type PurchaseType } from "@/lib/shopify-products";
import { useCart } from "@/components/CartContext";

function PackCard({ p }: { p: PackOption }) {
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("subscription");
  const { addItem } = useCart();
  const option = purchaseType === "onetime" ? p.onetime : p.subscription;
  const savings = p.onetime.price - p.subscription.price;
  const isSub = purchaseType === "subscription";

  return (
    <div className="glass-card flex flex-col rounded-2xl p-6 transition-shadow hover:shadow-lg">
      {/* Pack image — layered balls (3 / 12 / 36 / 100).
          Brand + recycling marks sit on the product itself so the
          trademark shows a direct association with the ball being
          purchased at point of sale (USPTO specimen requirement). */}
      <div className="relative mb-5 flex aspect-[4/5] items-center justify-center overflow-hidden rounded-xl bg-white/35">
        {/* Balls pinned to the top so the bottom stays an empty zone
            for the specimen mark — no overlap with the product. */}
        <Image
          src={p.image}
          alt={`BounceBack BB-1 recycled pickleball — ${p.label}`}
          width={500}
          height={500}
          className="h-full w-full object-contain object-top p-2 pb-24"
        />

        {/* Trademark + recycling specimen mark — sits in the empty
            space below the balls. Light pill so both the BounceBack
            mark and the recycling symbol stay legible. */}
        <div className="absolute inset-x-2 bottom-3 flex items-center justify-between gap-2 rounded-full bg-bb-cream/95 px-4 py-2 shadow-sm ring-1 ring-bb-deep/10">
          <Image
            src="/bbbblogo.png"
            alt="BounceBack Pickle"
            width={32}
            height={32}
            className="h-7 w-7 shrink-0 object-contain"
          />
          <span className="text-[9px] font-bold uppercase leading-tight tracking-[0.06em] text-bb-deep">
            BounceBack BB-1
          </span>
          <Image
            src="/recyclinglogo.png"
            alt="Recycled pickleball"
            width={18}
            height={18}
            className="h-4 w-4 shrink-0 object-contain"
          />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <h3 className="text-xl font-bold text-bb-deep">{p.label}</h3>
        <span className="text-xs font-medium tracking-wide text-bb-deep/50">
          {p.count} balls
        </span>
      </div>

      {/* Mini purchase-type toggle */}
      <div className="mt-5 flex w-full rounded-full border border-white/60 bg-white/35 p-0.5 text-[11px] font-semibold tracking-wide">
        <button
          type="button"
          onClick={() => setPurchaseType("subscription")}
          className={`flex-1 rounded-full px-2 py-1.5 transition-colors ${
            isSub
              ? "bg-bb-deep text-bb-cream"
              : "text-bb-deep/60 hover:text-bb-deep"
          }`}
        >
          Subscribe
        </button>
        <button
          type="button"
          onClick={() => setPurchaseType("onetime")}
          className={`flex-1 rounded-full px-2 py-1.5 transition-colors ${
            !isSub
              ? "bg-bb-deep text-bb-cream"
              : "text-bb-deep/60 hover:text-bb-deep"
          }`}
        >
          One-time
        </button>
      </div>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-bb-deep">
          ${option.price.toFixed(2)}
        </span>
        {isSub && savings > 0 && (
          <span className="text-xs font-semibold uppercase tracking-wider text-bb-mid">
            save ${savings.toFixed(2)}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-bb-deep/50">
        {isSub ? "per delivery" : "one-time"}
      </p>

      <p className="mt-4 text-xs text-bb-deep/50">{p.shippingNote}</p>

      {/* Subscription-specific preorder note */}
      {isSub && (
        <p className="mt-3 rounded-lg bg-white/40 p-3 text-[11px] leading-relaxed text-bb-deep/70">
          Billed monthly starting today. Any deliveries that bill before our
          August 31, 2026 ship date arrive together in your first box — e.g.
          subscribe June 1 and your June, July + August shipments come at once.
        </p>
      )}

      <button
        type="button"
        onClick={() =>
          addItem({
            id: option.variantId,
            name: `BB-1 ${p.label}`,
            variant: isSub
              ? "Subscription — monthly delivery"
              : "One-time purchase",
            price: option.price,
            image: p.image,
            sellingPlanId: isSub ? p.subscription.sellingPlanId : undefined,
          })
        }
        className="mt-6 block w-full rounded-full bg-bb-deep px-5 py-3 text-center text-sm font-semibold tracking-[0.12em] text-bb-cream transition-colors hover:bg-bb-deep/90"
      >
        ADD TO CART
      </button>
    </div>
  );
}

export default function PreorderPacksSection({
  id = "preorder",
  heading,
  className = "",
}: {
  id?: string;
  heading?: string;
  className?: string;
}) {
  return (
    <section id={id} className={`mx-auto max-w-6xl px-6 pb-20 md:px-12 lg:px-16 ${className}`}>
      {heading && (
        <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-bb-deep md:text-4xl lg:text-5xl">
          {heading}
        </h2>
      )}

      {/* Brand mark — shown at point of sale */}
      <div className="mb-8 flex justify-center">
        <Image
          src="/bbbblogo.png"
          alt="BounceBack Pickle logo"
          width={140}
          height={140}
          className="h-auto w-[110px] md:w-[140px]"
        />
      </div>

      {/* Preorder banner — visible above the pack grid */}
      <div className="glass-card mx-auto mb-8 max-w-3xl rounded-2xl px-6 py-5 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-bb-deep">
          Preorder · First shipment August 31, 2026
        </p>
        <p className="mt-2 text-sm text-bb-deep/70">
          We&rsquo;re still in production. Dates may shift — we&rsquo;ll email
          you the moment your order leaves the warehouse.
        </p>
      </div>

      {/* Pack cards — each has its own One-time / Subscribe toggle */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-4 lg:gap-8">
        {PACKS.map((p) => (
          <PackCard key={p.pack} p={p} />
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-bb-deep/40">
        Secure checkout via Shopify. You&rsquo;ll receive an email confirmation
        once your preorder is reserved.
      </p>
    </section>
  );
}
