"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCart } from "./CartContext";
import { SHOP_DOMAIN } from "@/lib/shopify-products";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    totalItems,
    subtotal,
  } = useCart();

  const drawerRef = useRef<HTMLDivElement>(null);
  const [redirecting, setRedirecting] = useState(false);

  function handleCheckout() {
    if (items.length === 0) return;
    // Shopify's current checkout ignores ?selling_plan= on the old
    // /cart/{variantId}:{qty} permalink format (the line silently becomes a
    // one-time purchase). The /cart/add endpoint DOES honor selling_plan per
    // call, so we chain adds via return_to:
    //   /cart/clear → /cart/add (item 1) → /cart/add (item 2) → /checkout
    // Each hop redirects to the next. This also supports mixed carts with
    // per-line subscription plans, which the single query param never could.
    let next = "/checkout";
    for (const item of [...items].reverse()) {
      const params = new URLSearchParams({
        id: item.id,
        quantity: String(item.quantity),
      });
      if (item.sellingPlanId) {
        params.set("selling_plan", item.sellingPlanId);
      }
      params.set("return_to", next);
      next = `/cart/add?${params.toString()}`;
    }
    const url = `https://${SHOP_DOMAIN}/cart/clear?return_to=${encodeURIComponent(next)}`;
    setRedirecting(true);
    window.location.href = url;
  }

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    if (isOpen) {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [isOpen, closeCart]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[9000] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
          />

          {/* Drawer panel */}
          <motion.div
            ref={drawerRef}
            className="fixed top-0 right-0 z-[9001] flex h-full w-full max-w-[480px] flex-col bg-white shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
          >
            {/* ─── Header ─── */}
            <div className="flex items-center justify-between border-b border-black/10 px-8 py-6">
              <h2 className="text-lg font-semibold text-black">
                Shopping Cart ({totalItems})
              </h2>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="flex h-8 w-8 items-center justify-center text-black/40 transition-colors hover:text-black"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <line x1="4" y1="4" x2="20" y2="20" />
                  <line x1="20" y1="4" x2="4" y2="20" />
                </svg>
              </button>
            </div>

            {/* ─── Items list ─── */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#084734"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mb-4 opacity-30"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  <p className="text-sm text-black/40">Your cart is empty</p>
                  <button
                    onClick={closeCart}
                    className="mt-4 text-sm font-medium text-bb-deep underline-offset-2 hover:underline"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-0">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-5 border-b border-black/5 py-6 first:pt-0"
                    >
                      {/* Product image */}
                      <div className="flex h-[100px] w-[100px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-bb-cream">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={100}
                          height={100}
                          className="h-full w-full object-contain p-2"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-black">
                            {item.name}
                          </h3>
                          <p className="mt-0.5 text-xs text-black/40">
                            {item.variant}
                          </p>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="flex h-7 w-7 items-center justify-center rounded border border-black/10 text-xs text-black/60 transition-colors hover:border-black/30"
                          >
                            -
                          </button>
                          <span className="min-w-[20px] text-center text-sm font-medium text-black">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="flex h-7 w-7 items-center justify-center rounded border border-black/10 text-xs text-black/60 transition-colors hover:border-black/30"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Price + delete */}
                      <div className="flex flex-col items-end justify-between">
                        <p className="text-sm font-semibold text-black">
                          $ {(item.price * item.quantity).toLocaleString()}
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="text-black/25 transition-colors hover:text-black/60"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ─── Footer: subtotal + checkout ─── */}
            {items.length > 0 && (
              <div className="border-t border-black/10 px-8 py-6">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-sm text-black/50">Sub Total:</span>
                  <span className="text-lg font-bold text-black">
                    $ {subtotal.toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={redirecting}
                  className="w-full bg-bb-deep py-4 text-sm font-semibold tracking-[0.1em] text-white transition-colors hover:bg-bb-deep/90 disabled:opacity-60"
                >
                  {redirecting ? "REDIRECTING…" : "CHECKOUT"}
                </button>
                <p className="mt-3 text-center text-[11px] text-black/40">
                  Secure checkout via Shopify
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
