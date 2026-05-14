import Image from "next/image";

export default function WhyChooseSection() {
  return (
    <section className="w-full bg-bb-cream py-24 pb-24 md:py-32 md:pb-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        {/* Heading */}
        <h2 className="mb-16 text-center text-3xl font-bold text-black md:text-4xl lg:text-5xl">
          Why choose <span className="text-bb-deep">BounceBack</span>?
        </h2>

        {/* Feature cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Card 1 — Efficient recycling */}
          <div className="rounded-xl border-2 border-bb-lime bg-white p-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-bb-mint">
              <Image src="/actrecycling.png" alt="Recycling" width={28} height={28} className="h-7 w-7" />
            </div>
            <p className="mb-2 text-base font-bold text-black md:text-lg">
              Closed Loop Recycling.
            </p>
            <p className="text-sm leading-relaxed text-black/60 md:text-base">
              We&apos;re recycling old and cracked pickleballs to fully close the loop and give balls a second life to save the environment in the sport we love.
            </p>
          </div>

          {/* Card 2 — 1-1 Same feel */}
          <div className="rounded-xl border-2 border-bb-lime bg-white p-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-bb-mint">
              <span className="text-2xl font-bold text-black">=</span>
            </div>
            <p className="mb-2 text-base font-bold text-black md:text-lg">
              1-1 Same feel with Pro Pickleballs.
            </p>
            <p className="text-sm leading-relaxed text-black/60 md:text-base">
              Our recycling and remanufacturing process is designed to replicate the same experience as a professional pickleball.
            </p>
          </div>

          {/* Card 3 — Cost Effective */}
          <div className="rounded-xl border-2 border-bb-lime bg-white p-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-bb-mint">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-black"
              >
                <path d="m11 17 2 2a1 1 0 1 0 3-3" />
                <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
                <path d="m21 3 1 11h-2" />
                <path d="M3 3 2 14h2" />
                <path d="m3 4 2.71.71a2 2 0 0 0 1.42-.25l.47-.28a5.79 5.79 0 0 1 4.4-.69" />
                <path d="m6 16 2 2a1 1 0 1 0 3-3" />
              </svg>
            </div>
            <p className="mb-2 text-base font-bold text-black md:text-lg">
              Trusted by the community.
            </p>
            <p className="text-sm leading-relaxed text-black/60 md:text-base">
              Our transparent process allows you to watch the steps we've taken to get here as well as see our future plans for the movement.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
