import { NextResponse } from "next/server";

// The contact page's form. The backend sends the email (it holds the Resend
// key); this only rate-limits and passes the message through.

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

// Simple in-memory rate limiting (per serverless instance)
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3; // messages per window
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes

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
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "That's a few messages already. Please try again in a little while." },
      { status: 429 }
    );
  }

  const body = await req.text();
  try {
    const upstream = await fetch(`${BACKEND}/api/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    console.error("Contact message relay failed:", err);
    return NextResponse.json(
      { error: "We couldn't send that just now. Please try again." },
      { status: 502 }
    );
  }
}
