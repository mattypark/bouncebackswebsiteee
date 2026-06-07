// Shopify product configuration for BB-1 preorder.
//
// SETUP:
// 1. Fill in SHOP_DOMAIN with your Shopify store domain.
//    Use your *.myshopify.com domain, NOT your custom domain, so cart
//    permalinks always resolve correctly (Shopify will still redirect
//    to the custom storefront once attached). Example: "bounceback-pickle.myshopify.com"
// 2. Create the 4 products + 2 variants each in Shopify Admin.
// 3. Paste each variant's numeric ID below. Find it in the variant's
//    URL: /admin/products/.../variants/{VARIANT_ID}
//
// Buy-button links use cart permalinks:
//   https://{shop}/cart/{variantId}:{qty}
// which adds the item and sends the customer straight to Shopify
// checkout. Shopify handles tax, shipping, subscription billing.
//
// For subscription variants, the SELLING_PLAN_ID must be included in
// the checkout URL so Shopify treats the line as recurring. Find it
// in the Shopify Subscriptions app URL when editing a plan.

export const SHOP_DOMAIN = "fpebnm-dn.myshopify.com";

// Shared selling plan ID for the "BB-1 Monthly Delivery" plan.
// All subscription variants are attached to this plan.
export const SUBSCRIPTION_SELLING_PLAN_ID = "4537975023";

export type Pack = "3" | "12" | "36" | "100";
export type PurchaseType = "onetime" | "subscription";

export interface PackOption {
  pack: Pack;
  label: string;
  count: number;
  image: string;
  onetime: {
    price: number;       // dollars
    variantId: string;   // Shopify variant ID
  };
  subscription: {
    price: number;
    variantId: string;
    sellingPlanId: string;
  };
  shippingNote: string;
}

export const PACKS: PackOption[] = [
  {
    pack: "3",
    label: "3-Pack",
    count: 3,
    image: "/pack-3.png",
    onetime:      { price: 12.99, variantId: "49594638237935" },
    subscription: { price:  9.99, variantId: "49594638270703", sellingPlanId: SUBSCRIPTION_SELLING_PLAN_ID },
    shippingNote: "+ $2.99 shipping",
  },
  {
    pack: "12",
    label: "12-Pack",
    count: 12,
    image: "/pack-12.png",
    onetime:      { price: 39.99, variantId: "49594641449199" },
    subscription: { price: 34.99, variantId: "49594641481967", sellingPlanId: SUBSCRIPTION_SELLING_PLAN_ID },
    shippingNote: "+ $4.99 shipping",
  },
  {
    pack: "36",
    label: "36-Pack",
    count: 36,
    image: "/pack-36.png",
    onetime:      { price: 94.99, variantId: "49594636435695" },
    subscription: { price: 79.99, variantId: "49594636468463", sellingPlanId: SUBSCRIPTION_SELLING_PLAN_ID },
    shippingNote: "Free shipping",
  },
  {
    pack: "100",
    label: "100-Pack",
    count: 100,
    image: "/pack-100.png",
    onetime:      { price: 229.99, variantId: "49594645512431" },
    subscription: { price: 189.99, variantId: "49594645545199", sellingPlanId: SUBSCRIPTION_SELLING_PLAN_ID },
    shippingNote: "Free shipping",
  },
];

export function checkoutUrl(variantId: string, qty = 1): string {
  return `https://${SHOP_DOMAIN}/cart/${variantId}:${qty}`;
}
