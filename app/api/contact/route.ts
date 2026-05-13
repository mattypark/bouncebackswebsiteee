import { Resend } from "resend";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { name, email, phone, organization, relationship, message } = await req.json();

  // Store bin request in Supabase
  const { error: dbError } = await supabase
    .from("bin_requests")
    .insert({ name, email, phone: phone || null, organization: organization || null, relationship: relationship || null, message: message || null });

  if (dbError) {
    console.error("Supabase insert error:", dbError);
  }

  // 1. Notify Dillon with the submission details
  const { error: notifyError } = await resend.emails.send({
    from: "BounceBack Form <recycle@bouncebackpickle.com>",
    to: "Bouncebackpickle@gmail.com",
    subject: `New Bin Request from ${name}`,
    text: `New bin request submitted:

Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Organization: ${organization || "Not provided"}
Relationship to Facility: ${relationship || "Not provided"}
Message: ${message || "None"}`,
  });

  if (notifyError) {
    console.error("Resend notify error:", notifyError);
    return NextResponse.json({ error: "Failed to send submission." }, { status: 500 });
  }

  // 2. Send confirmation email to the person who submitted
  const { error: confirmError } = await resend.emails.send({
    from: "Dillon @ BounceBack <recycle@bouncebackpickle.com>",
    to: email,
    subject: "Welcome to BounceBack ♻️",
    text: `Hi ${name}!

Thank you so much for reaching out and for your interest in bringing BounceBack to your facility.

We're excited to get you involved with our Sustainable Facility Program, and you'll find all program details in the form below:

http://tinyurl.com/BounceBackRecycle

To begin recycling with BounceBack and join as an facility partner, simply complete the form, and we will take care of getting your recycling bin shipped, along with everything that comes included in your program. If any questions come up, feel free to reply here - we are happy to help.

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
