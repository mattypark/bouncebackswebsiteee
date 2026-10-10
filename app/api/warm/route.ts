import { NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

// The Railway backend sleeps when idle and takes ~35s to wake. The sign-up
// page pings this on load so the backend is awake by the time the visitor
// reaches "Pay now", instead of the first real request paying for the wake.
export async function GET() {
  try {
    const upstream = await fetch(`${BACKEND}/health`, { cache: "no-store" });
    return NextResponse.json({ ok: upstream.ok });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
