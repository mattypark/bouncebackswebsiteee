import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import SiteFooter from "@/components/SiteFooter";
import TallyEmbed from "./TallyEmbed";

/*
  Ambassador program sign-up. The form itself lives in Tally (Dillon owns it
  and its responses); this page frames it in the sports system so it reads as
  part of the site instead of a bare off-site link.
*/

export const metadata: Metadata = {
  title: "Become an Ambassador — BounceBack",
  description:
    "Players, coaches, facility staff and community organizers: apply to rep BounceBack recycled pickleballs at your courts.",
};

const FORM_URL = "https://tally.so/r/5BRlpd";

const WHO = ["Players", "Coaches", "Facility Staff", "Community Organizers"];

export default function AmbassadorPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-bb-paper text-bb-ink">
      <NavBar variant="dark" />

      <section className="mx-auto grid max-w-6xl gap-12 px-6 pt-32 pb-20 md:px-8 md:pt-40 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        {/* Intro — sticks beside the form on desktop */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="flex items-center gap-3">
            <span className="slash-pair text-bb-mid" aria-hidden>
              <span />
              <span />
            </span>
            <p className="sport-kicker text-bb-mid">Ambassador Program</p>
          </div>

          <h1 className="sport-display mt-6 text-5xl md:text-6xl lg:text-7xl">
            Rep the ball.
            <br />
            <span className="text-bb-mid">Grow the loop.</span>
          </h1>

          <p className="mt-8 max-w-md text-base leading-relaxed text-bb-ink/60 md:text-lg">
            BounceBack ambassadors bring recycled pickleballs to their courts and
            get their communities recycling. Tell us about yourself and we&apos;ll
            be in touch.
          </p>

          <ul className="mt-10 flex flex-wrap gap-2">
            {WHO.map((who) => (
              <li
                key={who}
                className="border border-bb-ink/15 px-4 py-2 text-xs font-semibold tracking-[0.15em] uppercase text-bb-ink/70"
              >
                {who}
              </li>
            ))}
          </ul>

          <p className="mt-10 text-sm text-bb-ink/50">
            Form not loading?{" "}
            <a
              href={FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-bb-ink underline underline-offset-4 hover:text-bb-mid"
            >
              Open it on Tally
            </a>
          </p>
        </div>

        {/* Form */}
        <div className="min-w-0 bg-white px-5 py-8 shadow-[0_1px_0_rgba(8,71,52,0.08)] md:px-10 md:py-10">
          <TallyEmbed />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
