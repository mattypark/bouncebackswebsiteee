import { NextResponse } from "next/server";

// Simple in-memory rate limiting (per serverless instance)
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5; // max attempts per window
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

const CLOSE_API_BASE = "https://api.close.com/api/v1";

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

function closeAuthHeader(apiKey: string): string {
  // Close uses HTTP Basic auth: API key as username, empty password
  return `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;
}

async function findExistingLead(apiKey: string, email: string): Promise<boolean> {
  const res = await fetch(
    `${CLOSE_API_BASE}/lead/?query=${encodeURIComponent(`email_address:"${email}"`)}&_limit=1&_fields=id`,
    { headers: { Authorization: closeAuthHeader(apiKey) } }
  );

  if (!res.ok) {
    // Dedupe lookup failure shouldn't block signup — fall through to create
    console.error("Close lead search failed:", res.status, await res.text());
    return false;
  }

  const data = await res.json();
  return Array.isArray(data.data) && data.data.length > 0;
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

  // Close CRM config — server-side only, never exposed to browser
  const apiKey = process.env.CLOSE_API_KEY;
  if (!apiKey) {
    console.error("Missing CLOSE_API_KEY env var");
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

  try {
    // Dedupe: if a lead already has this email, treat as success
    const exists = await findExistingLead(apiKey, normalizedEmail);
    if (exists) {
      return NextResponse.json({ success: true });
    }

    const res = await fetch(`${CLOSE_API_BASE}/lead/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: closeAuthHeader(apiKey),
      },
      body: JSON.stringify({
        name: normalizedEmail,
        contacts: [
          {
            name: normalizedEmail,
            emails: [{ email: normalizedEmail, type: "office" }],
          },
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("Close lead create error:", res.status, detail);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Close lead create request failed:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
