# Context — BounceBack Pickle: Preorder Launch

Working context for the BounceBack Pickle website during the BB-1 preorder
launch. BounceBack = recycled pickleball brand. Site: bouncebackpickle.com.
Founder: Dillon Rosenthal.

## Repos

- **Frontend** — `Bouncebackwebsite/` — Next.js 16 (App Router), React 19, TS 5,
  Tailwind v4, Framer Motion, Lenis. Hosted on Vercel. Redeploy needs git push.
- **Backend** — `bounceback-website-backend/` — Express 4 + TS (ts-node-dev).
  Deployed on Railway (`bounceback-shipping-production.up.railway.app`).
  Redeploy needs git push.

## Active workstreams

1. **Google Sheets payment links** — DONE (code). See "Payment link fix" below.
2. **Kit (ConvertKit) waitlist** — route wired, needs env keys + deploy.
3. **Shopify B2B portals** — NOT started.

---

## Payment link fix (DONE — pending deploy)

**Problem:** some Sustainable Facility Program rows in the Google Sheet had no
payment link in col O (e.g. wiggly1, paulmkristoff, montana). michaela (Volo) /
dominic (Spanish Wells) had links.

**Root cause:** col O link (`BB-LF-XXXX`) only written when a Stripe Checkout
session is created. That fired only at **step 3 -> 4** (`saveProgram`) and at
step 4 pay. Rows that saved steps 1-2 (contact + facility) but dropped before
finishing step 3 never created a session -> no link. Not slow processing.

**Fix:** `app/request-bin/page.tsx` `saveFacility` (~line 326) now fires
`/api/stripe-checkout` right after the step-2 row save. Every saved row gets a
$150 membership link in col O immediately. Adding bins in step 3 still
overwrites col O with the bin-inclusive link.

**Still open:**
- Existing 3 blank rows do NOT backfill — only new submissions. Manual
  re-trigger needed for those.
- Secondary gap (not fixed): backend -> Apps Script `save-payment-link` is
  fire-and-forget, no retry (`stripe-checkout.ts:149`). One dropped call = lost
  link.

### Payment flow (how col O gets written)

- Frontend `/api/stripe-checkout/route.ts` -> proxies to Express backend.
- Backend `src/routes/stripe-checkout.ts` -> creates Stripe session
  (membership $150/yr + 3.3% convenience fee + optional $50/bin), then
  fire-and-forget POSTs `save-payment-link` to Apps Script -> col O HYPERLINK.
- Label `BB-LF-XXXX` = last 4 of Stripe session id.

### Apps Script (single source of truth)

`APPS_SCRIPT_FULL.md`. doPost actions: `facility` (writes A-N, returns
rowNumber), `program` (K,L,M), `checkout-started` (R,U), `subscribed`
(P,Q,R,U), `save-payment-link` (O HYPERLINK), `checkout-canceled` (clears R).
Timers: `checkForNewSubscribers` (forwards subscribed rows to backend),
`sendPaymentReminders` (Gmail follow-up, 5min-24hr window, marks col AA).

---

## Backend migration: Supabase -> Kit (IN PROGRESS)

Decision: waitlist -> Kit (ConvertKit). bin_requests = deadweight, remove. Auth
= defer (re-add later). **No Convex needed** — once waitlist is on Kit and
bin_requests/auth are gone, nothing requires Convex OR Supabase.

**Done:** `app/api/waitlist/route.ts` rewritten to POST to Kit v4 API
(`https://api.kit.com/v4/forms/{KIT_FORM_ID}/subscribers`, header
`X-Kit-Api-Key`). Supabase import removed from that route.

**Needs (add to `.env.local`, never commit secrets):**
```
KIT_API_KEY=...      # Kit -> Settings -> Developer
KIT_FORM_ID=...      # from the form URL / embed
```

**Removable env vars after migration:** `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

**Pending (need user OK — touches shared infra / file deletes):**
- Delete orphaned `lib/supabase.ts` (zero imports now).
- Drop `@supabase/supabase-js` dep.
- Backend `bin_requests` + `auth` Supabase removal.
- Delete Supabase project from dashboard — only AFTER Kit verified live.

---

## Shopify (BB-1 preorder)

- `lib/shopify-products.ts` — SHOP_DOMAIN `fpebnm-dn.myshopify.com`,
  SUBSCRIPTION_SELLING_PLAN_ID `4537975023`. 4 packs (3/12/36/100), each with
  one-time + subscription variant. `checkoutUrl()` builds cart permalink.
- Subscription confirmed working (`?selling_plan=4537975023` in checkout URL).
- Pack cards + cart use layered ball images (`/pack-3.png` ... `/pack-100.png`).
- BB-1 page default purchaseType = subscription. First shipment July 31, 2026.

## Misc shipped this launch

- Hero text: "We're turning the fastest growing sport into the first
  sustainable sport." (`components/HeroSection.tsx`).
- PREORDER BB-1 button -> `/bb-1` (was `/bb-1#preorder`, scrolled past top).
- New facilities on locations map: Spanish Wells Golf & Country Club (Bonita
  Springs FL), Club Volo - South Broadway (Denver CO).
