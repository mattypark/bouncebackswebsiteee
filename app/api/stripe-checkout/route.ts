import { NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const origin = req.headers.get("origin") || "";

  const upstream = await fetch(`${BACKEND}/api/stripe-checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, origin }),
  });
  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
