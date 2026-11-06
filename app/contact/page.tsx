import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import SiteFooter from "@/components/SiteFooter";
import ContactForm from "./ContactForm";

/*
  Contact us: a plain form whose messages land in the recycle inbox (the
  backend's /api/message sends them, reply-to the sender).
*/

export const metadata: Metadata = {
  title: "Contact Us — BounceBack",
  description:
    "Questions about recycled pickleballs, bins at your facility, or anything else? Send BounceBack a message.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-bb-paper text-bb-ink">
      <NavBar variant="dark" />

      <section className="mx-auto grid max-w-6xl gap-12 px-6 pt-32 pb-20 md:px-8 md:pt-40 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="flex items-center gap-3">
            <span className="slash-pair text-bb-mid" aria-hidden>
              <span />
              <span />
            </span>
            <p className="sport-kicker text-bb-mid">Contact Us</p>
          </div>

          <h1 className="sport-display mt-6 text-5xl md:text-6xl lg:text-7xl">
            Say hi.
            <br />
            <span className="text-bb-mid">We read it all.</span>
          </h1>

          <p className="mt-8 max-w-md text-base leading-relaxed text-bb-ink/60 md:text-lg">
            Questions about our balls, a bin at your courts, or anything else.
            Send us a note and we&apos;ll get back to you.
          </p>

          <p className="mt-10 text-sm text-bb-ink/50">
            Rather email?{" "}
            <a
              href="mailto:recycle@bouncebackpickle.com"
              className="font-semibold text-bb-ink underline underline-offset-4 hover:text-bb-mid"
            >
              recycle@bouncebackpickle.com
            </a>
          </p>
        </div>

        <div className="min-w-0 bg-white px-5 py-8 shadow-[0_1px_0_rgba(8,71,52,0.08)] md:px-10 md:py-10">
          <ContactForm />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
