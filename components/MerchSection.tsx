"use client";

import { useState } from "react";
import Image from "next/image";
import { MERCH, type MerchProduct } from "@/lib/shopify-merch";
import { useCart } from "@/components/CartContext";

function MerchCard({ p }: { p: MerchProduct }) {
  const { addItem } = useCart();
  const firstAvailable = p.sizes.find((s) => s.variantId)?.size ?? "";
  const [size, setSize] = useState(firstAvailable);

  const selected = p.sizes.find((s) => s.size === size);
  const canAdd = Boolean(selected?.variantId);

  return (
    <div className="glass-card flex flex-col rounded-2xl p-6 transition-shadow hover:shadow-lg">
      {/* Product image */}
      <div className="mb-5 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-white/35">
        <Image
          src={p.image}
          alt={p.name}
          width={500}
          height={500}
          className="h-full w-full object-contain p-2"
        />
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-xl font-bold text-bb-deep">{p.name}</h3>
        <span className="shrink-0 text-lg font-bold text-bb-deep">
          ${p.price.toFixed(2)}
        </span>
      </div>

      {p.description && (
        <p className="mt-1 text-xs leading-relaxed text-bb-deep/50">
          {p.description}
        </p>
      )}

      {/* Size picker */}
      <div className="mt-5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-bb-deep/60">
          Size
        </p>
        <div className="flex flex-wrap gap-2">
          {p.sizes.map((s) => {
            const disabled = !s.variantId;
            const active = s.size === size;
            return (
              <button
                key={s.size}
                type="button"
                disabled={disabled}
                onClick={() => setSize(s.size)}
                aria-pressed={active}
                className={`min-w-[44px] rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "border-bb-deep bg-bb-deep text-bb-cream"
                    : disabled
                      ? "cursor-not-allowed border-white/50 bg-white/20 text-bb-deep/30 line-through"
                      : "border-white/60 bg-white/35 text-bb-deep/70 hover:text-bb-deep"
                }`}
              >
                {s.size}
              </button>
            );
          })}
        </div>
      </div>

      {p.shippingNote && (
        <p className="mt-4 text-xs text-bb-deep/50">{p.shippingNote}</p>
      )}

      <button
        type="button"
        disabled={!canAdd}
        onClick={() => {
          if (!selected?.variantId) return;
          addItem({
            id: selected.variantId,
            name: p.name,
            variant: `Size ${selected.size}`,
            price: p.price,
            image: p.image,
          });
        }}
        className="mt-6 block w-full rounded-full bg-bb-deep px-5 py-3 text-center text-sm font-semibold tracking-[0.12em] text-bb-cream transition-colors hover:bg-bb-deep/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {canAdd ? "ADD TO CART" : "COMING SOON"}
      </button>
    </div>
  );
}

interface MerchSectionProps {
  id?: string;
  heading?: string;
  /** When set, shows a "View all" link (used on the homepage feature). */
  viewAllHref?: string;
  /** Cap the number of products shown (e.g. homepage feature strip). */
  limit?: number;
  className?: string;
}

export default function MerchSection({
  id = "merch",
  heading,
  viewAllHref,
  limit,
  className = "",
}: MerchSectionProps) {
  const products = typeof limit === "number" ? MERCH.slice(0, limit) : MERCH;

  return (
    <section
      id={id}
      className={`mx-auto max-w-6xl px-6 pb-20 md:px-12 lg:px-16 ${className}`}
    >
      {heading && (
        <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-bb-deep md:text-4xl lg:text-5xl">
          {heading}
        </h2>
      )}

      {/* flex + justify-center so 1–2 products sit centered instead of hugging the left column */}
      <div className="flex flex-wrap justify-center gap-6 sm:gap-7 lg:gap-8">
        {products.map((p) => (
          <div key={p.slug} className="w-full max-w-sm">
            <MerchCard p={p} />
          </div>
        ))}
      </div>

      {viewAllHref && (
        <div className="mt-10 flex justify-center">
          <a
            href={viewAllHref}
            className="group inline-flex items-center gap-2 rounded-full border-2 border-bb-deep px-7 py-3 text-sm font-semibold tracking-[0.12em] text-bb-deep transition-colors hover:bg-bb-deep hover:text-bb-cream"
          >
            SHOP ALL MERCH
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
      )}
    </section>
  );
}
