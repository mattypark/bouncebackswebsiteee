"use client";

import { useState } from "react";
import Image from "next/image";
import { MERCH, SHOP_DOMAIN, type MerchProduct } from "@/lib/shopify-merch";

/*
  Apparel block for /shop. Same zero-cart rule as the ball packs: pick a size,
  hit BUY NOW, land in Shopify checkout. Merch is one-time only, so there is
  no selling plan on the line.

  A size with an empty variantId is not live yet and renders disabled. A
  product with no live sizes renders as COMING SOON.
*/

function buyUrl(variantId: string): string {
  const params = new URLSearchParams({ id: variantId, quantity: "1" });
  params.set("return_to", "/checkout");

  return `https://${SHOP_DOMAIN}/cart/clear?return_to=${encodeURIComponent(
    `/cart/add?${params.toString()}`
  )}`;
}

function MerchCard({ product }: { product: MerchProduct }) {
  const liveSizes = product.sizes.filter((s) => s.variantId);
  const [selected, setSelected] = useState(liveSizes[0]?.size ?? "");

  const variantId = product.sizes.find((s) => s.size === selected)?.variantId ?? "";
  const soldOut = liveSizes.length === 0;

  return (
    <div className="grid overflow-hidden rounded-2xl border border-black/10 bg-white md:grid-cols-2">
      <div className="flex aspect-square items-center justify-center bg-bb-court">
        <Image
          src={product.image}
          alt={product.name}
          width={620}
          height={620}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-col justify-center p-8 md:p-10">
        <p className="sport-kicker text-bb-mid">Wear the movement</p>
        <h3 className="sport-display mt-3 text-4xl text-bb-ink md:text-5xl">
          {product.name}
        </h3>

        {product.description && (
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-bb-ink/60">
            {product.description}
          </p>
        )}

        <p className="mt-5 text-2xl font-black text-bb-ink">
          ${product.price.toFixed(2)}
          {product.shippingNote && (
            <span className="ml-2 text-xs font-semibold text-bb-ink/45">
              {product.shippingNote}
            </span>
          )}
        </p>

        {soldOut ? (
          <p className="mt-7 w-fit bg-black/[0.06] px-8 py-4 text-sm font-black tracking-[0.2em] text-bb-ink/40 uppercase">
            Coming Soon
          </p>
        ) : (
          <>
            <p className="mt-6 text-sm font-bold text-bb-ink">Size</p>
            <div className="mt-2 flex gap-2">
              {product.sizes.map((s) => {
                const live = Boolean(s.variantId);
                return (
                  <button
                    key={s.size}
                    onClick={() => live && setSelected(s.size)}
                    disabled={!live}
                    className={`h-11 w-14 rounded-lg border text-sm font-bold transition-all ${
                      s.size === selected
                        ? "border-bb-ink bg-white text-bb-ink ring-1 ring-bb-ink"
                        : live
                          ? "border-black/15 bg-white text-bb-ink/60 hover:border-bb-ink hover:text-bb-ink"
                          : "cursor-not-allowed border-black/10 bg-black/[0.03] text-bb-ink/25 line-through"
                    }`}
                  >
                    {s.size}
                  </button>
                );
              })}
            </div>

            <a
              href={buyUrl(variantId)}
              className="mt-7 inline-block w-fit bg-bb-ink px-10 py-4 text-sm font-black tracking-[0.2em] text-bb-volt uppercase transition-colors duration-200 hover:bg-bb-volt hover:text-bb-ink"
            >
              Buy Now →
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function MerchSection({ id }: { id?: string }) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 pb-20">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="sport-display text-3xl text-bb-ink md:text-4xl">Apparel</h2>
        <p className="text-xs font-semibold text-bb-mid">Goes straight to checkout →</p>
      </div>

      <div className="grid gap-6">
        {MERCH.map((product) => (
          <MerchCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
