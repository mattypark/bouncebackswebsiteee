import { Resend } from "resend";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const GOOGLE_SHEETS_WEBHOOK_URL =
  process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
  "https://script.google.com/macros/s/AKfycby8jNGuoNbpRmhSQe7b6Z7isyTSFMF5593zP65L9j2xQlVMge0PUt64WWHFVZNcFU2D/exec";

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const body = await req.json();
  const {
    firstName = "",
    lastName = "",
    phone = "",
    email = "",
    facilityName = "",
    streetAddress = "",
    city = "",
    state = "",
    zipCode = "",
    additionalBins = "",
    agreedTerms = false,
    agreedUpdates = false,
  } = body;

  // Fire-and-forget: append a row to the Google Sheet via Apps Script webhook.
  // Don't block the response or fail the request if this errors.
  fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch((err) => {
    console.error("Google Sheets webhook error:", err);
  });

  const fullName = `${firstName} ${lastName}`.trim();
  const fullAddress = [streetAddress, city, state, zipCode]
    .filter(Boolean)
    .join(", ");

  // Compose a structured summary that fits the existing `message` column
  const messageSummary = [
    `Facility: ${facilityName}`,
    `Address: ${fullAddress}`,
    `Membership: Sustainable Facility Accreditation Membership - $150/year`,
    `Additional Bins: ${additionalBins}`,
    `Agreed to Terms: ${agreedTerms ? "Yes" : "No"}`,
    `Wants Updates: ${agreedUpdates ? "Yes" : "No"}`,
  ].join("\n");

  // Store bin request in Supabase (existing schema)
  const { error: dbError } = await supabase.from("bin_requests").insert({
    name: fullName,
    email,
    phone: phone || null,
    organization: facilityName || null,
    relationship: null,
    message: messageSummary,
  });

  if (dbError) {
    console.error("Supabase insert error:", dbError);
  }

  // 1. Notify Dillon with the full submission
  const { error: notifyError } = await resend.emails.send({
    from: "BounceBack Form <recycle@bouncebackpickle.com>",
    to: "Bouncebackpickle@gmail.com",
    subject: `New Bin Request from ${fullName || email}`,
    text: `New facility sign-up:

— Contact —
Name: ${fullName}
Email: ${email}
Phone: ${phone || "Not provided"}

— Facility —
Name: ${facilityName}
Street: ${streetAddress}
City: ${city}
State: ${state}
Zip: ${zipCode}

— Program —
Membership: Sustainable Facility Accreditation Membership - $150/year
Additional Bins: ${additionalBins}
Agreed to Terms & Conditions: ${agreedTerms ? "Yes" : "No"}
Wants Program Updates: ${agreedUpdates ? "Yes" : "No"}`,
  });

  if (notifyError) {
    console.error("Resend notify error:", notifyError);
    return NextResponse.json({ error: "Failed to send submission." }, { status: 500 });
  }

  // 2. Send confirmation email to the submitter
  const { error: confirmError } = await resend.emails.send({
    from: "Dillon @ BounceBack <recycle@bouncebackpickle.com>",
    to: email,
    subject: "Welcome to BounceBack ♻️",
    text: `Hi ${firstName || "there"}!

Thank you so much for signing up ${facilityName ? `${facilityName} ` : ""}for the BounceBack Pickle Recycling Program.

We've received your submission and will be in touch shortly with next steps — including how to finalize your Sustainable Facility Accreditation Membership and schedule the shipment of your branded recycling receptacle${additionalBins && !additionalBins.toLowerCase().startsWith("no") ? ` (plus your ${additionalBins.toLowerCase()})` : ""}.

If any questions come up in the meantime, feel free to reply directly to this email — we're happy to help.

We look forward to partnering with you, bringing BounceBack to your location, and empowering your players to help give every cracked ball a second life.

Best,
Dillon Rosenthal
Founder, BounceBack Pickle`,
  });

  if (confirmError) {
    console.error("Resend confirm error:", confirmError);
    return NextResponse.json({ success: true, emailSent: false });
  }

  return NextResponse.json({ success: true, emailSent: true });
}
