import { NextResponse } from "next/server";

// Simple in-memory rate limiting (per serverless instance)
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5; // max attempts per window
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export async function POST(req: Request) {
  // Rate limit by IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  // Kit (ConvertKit) config — server-side only, never exposed to browser
  const apiKey = process.env.KIT_API_KEY;
  const formId = process.env.KIT_FORM_ID;
  if (!apiKey || !formId) {
    console.error("Missing KIT_API_KEY or KIT_FORM_ID env var");
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }

  const { email } = body;

  if (!email || typeof email !== "string" || !email.includes("@") || email.length > 320) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Add subscriber to the Kit form. Kit dedupes by email automatically,
  // so re-submitting an existing email succeeds (no duplicate created).
  try {
    const res = await fetch(`https://api.kit.com/v4/forms/${formId}/subscribers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kit-Api-Key": apiKey,
      },
      body: JSON.stringify({ email_address: normalizedEmail }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("Kit subscribe error:", res.status, detail);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Kit subscribe request failed:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
