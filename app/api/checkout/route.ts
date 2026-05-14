import { NextResponse } from "next/server";

const BASE_MEMBERSHIP_PRICE_CENTS = 15000; // $150.00
const ADDON_PRICE_PER_BIN_CENTS = 5000; // $50.00 per additional bin

function parseAdditionalBins(label: string): number {
  // Labels look like: "No additional bins", "1 additional bin - $50", "2 additional bins - $100", ...
  const match = label.match(/^(\d+)/);
  if (!match) return 0;
  const n = parseInt(match[1], 10);
  return Number.isFinite(n) ? n : 0;
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: "Payments are not configured yet." },
      { status: 503 }
    );
  }

  let stripeModule: typeof import("stripe");
  try {
    stripeModule = await import("stripe");
  } catch {
    return NextResponse.json(
      { error: "Stripe SDK is not installed." },
      { status: 503 }
    );
  }

  const Stripe = stripeModule.default;
  const stripe = new Stripe(secret);

  const {
    email = "",
    firstName = "",
    lastName = "",
    facilityName = "",
    additionalBins = "No additional bins",
  } = await req.json();

  const binsCount = parseAdditionalBins(additionalBins);

  const origin =
    req.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://bouncebackpickle.com";

  const lineItems: import("stripe").Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price_data: {
        currency: "usd",
        product_data: {
          name: "Sustainable Facility Accreditation Membership",
          description: facilityName
            ? `Annual membership for ${facilityName}`
            : "Annual membership — includes branded recycling receptacle & accreditation certificate.",
        },
        unit_amount: BASE_MEMBERSHIP_PRICE_CENTS,
      },
      quantity: 1,
    },
  ];

  if (binsCount > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: `Additional Recycling Bin${binsCount > 1 ? "s" : ""}`,
          description: `${binsCount} additional branded bin${binsCount > 1 ? "s" : ""}`,
        },
        unit_amount: ADDON_PRICE_PER_BIN_CENTS,
      },
      quantity: binsCount,
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: email || undefined,
      success_url: `${origin}/request-bin?paid=1`,
      cancel_url: `${origin}/request-bin?canceled=1`,
      metadata: {
        firstName,
        lastName,
        facilityName,
        additionalBins,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error.";
    console.error("Stripe checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
