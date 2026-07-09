// Shopify merch configuration (apparel + accessories).
//
// Same store and checkout path as the BB-1 packs (see shopify-products.ts).
// Each size is its own Shopify variant. Merch is one-time only (no selling
// plan), so it drops straight into the shared cart + Shopify checkout.
//
// SETUP (Shopify Admin):
// 1. Create one product per item below.
// 2. Add a "Size" option with the variants you carry (S / M / L / XL, etc.).
// 3. Copy each variant's numeric ID from its URL —
//    /admin/products/.../variants/{VARIANT_ID} — into `variantId`.
// 4. Drop the product photos in /public/merch/ and update `image`.
//
// Leave a size's `variantId` as "" to show it as sold-out / coming-soon
// until the variant is live. A product with no live sizes renders as
// "COMING SOON" and can't be added to cart.

import { SHOP_DOMAIN } from "./shopify-products";

export { SHOP_DOMAIN };

export interface MerchSize {
  size: string; // "S", "M", "L", "XL"
  variantId: string; // Shopify variant ID ("" = not yet available)
}

export interface MerchProduct {
  slug: string;
  name: string;
  price: number; // dollars
  image: string; // /merch/...
  description?: string;
  sizes: MerchSize[];
  shippingNote?: string;
}

export const MERCH: MerchProduct[] = [
  {
    slug: "bb-tee",
    name: "BounceBack Tee",
    price: 29.99,
    image: "/merch/bb-tee.jpg",
    description:
      "Garment-dyed Comfort Colors pocket tee in ivory, with the BounceBack Athletic Co. mark.",
    sizes: [
      { size: "M", variantId: "50145969078511" },
      { size: "L", variantId: "50145969111279" },
      { size: "XL", variantId: "50149599674607" },
    ],
    shippingNote: "+ $4.99 shipping",
  },
];
