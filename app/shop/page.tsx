import type { Metadata } from "next";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import WaitlistSection from "@/components/WaitlistSection";
import SiteFooter from "@/components/SiteFooter";
import MerchSection from "@/components/MerchSection";
import { PACKS } from "@/lib/shopify-products";

export const metadata: Metadata = {
  title: "Shop — BounceBack Pickle",
  description:
    "Shop BB-1 recycled performance pickleballs. Pro spec, closed-loop, subscribe & save.",
};

/*
  Shop grid — clean e-com cards (Dirty Bastard scent-cards reference).
  Cards link into the PDP; nothing is added to cart from here.
*/

const TAGS: Record<string, string[]> = {
  "3": ["Starter", "Try it out"],
  "12": ["Fan Favorite", "Weekly players"],
  "36": ["Clubs & Coaches", "Free shipping"],
  "100": ["Best Value", "Facilities"],
};

const PANELS: Record<string, string> = {
  "3": "bg-bb-court",
  "12": "bg-bb-mint",
  "36": "bg-bb-lime/60",
  "100": "bg-bb-ink",
};

export default function ShopPage() {
  const hundred = PACKS.find((p) => p.pack === "100")!;

  return (
    <main className="bg-bb-paper">
      <NavBar variant="dark" />

      {/* Header */}
      <section className="mx-auto max-w-6xl px-6 pt-14 pb-4 text-center md:pt-20">
        <p className="sport-kicker text-bb-mid">Explore the Line</p>
        <h1 className="sport-display mt-4 text-5xl text-bb-ink md:text-7xl">
          Balls That
          <br />
          Bounce Back.
        </h1>
      </section>

      {/* Best-value hero card — 100 pack */}
      <section className="mx-auto max-w-6xl px-6 pt-10">
        <div className="grid overflow-hidden rounded-2xl border border-black/10 bg-white md:grid-cols-2">
          <div className="relative flex items-center justify-center bg-bb-ink p-10">
            <span className="absolute top-5 left-5 rounded-full bg-bb-volt px-3 py-1 text-[10px] font-black tracking-[0.15em] text-bb-ink uppercase">
              Best Value
            </span>
            <Image
              src={hundred.image}
              alt="BB-1 100-pack"
              width={520}
              height={520}
              className="h-auto w-[80%]"
            />
          </div>
          <div className="flex flex-col justify-center p-8 md:p-12">
            <p className="sport-kicker text-bb-mid">The Facility Bundle</p>
            <h2 className="sport-display mt-3 text-4xl text-bb-ink md:text-5xl">
              Stock the whole court.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-bb-ink/60 md:text-base">
              100 pro-spec recycled balls. Subscribe for $
              {hundred.subscription.price.toFixed(2)} and save $
              {(hundred.onetime.price - hundred.subscription.price).toFixed(2)}{" "}
              every delivery — free shipping included.
            </p>
            <a
              href="/shop/100"
              className="mt-7 inline-block w-fit bg-bb-ink px-8 py-4 text-sm font-black tracking-[0.2em] text-bb-volt uppercase transition-colors duration-200 hover:bg-bb-volt hover:text-bb-ink"
            >
              Get the 100-Pack →
            </a>
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {PACKS.map((p) => (
          <a
            key={p.pack}
            href={`/shop/${p.pack}`}
            className="group overflow-hidden rounded-2xl border border-black/10 bg-white transition-shadow hover:shadow-xl"
          >
            <div
              className={`flex aspect-square items-center justify-center ${PANELS[p.pack]}`}
            >
              <Image
                src={p.image}
                alt={`BB-1 ${p.label}`}
                width={360}
                height={360}
                className="h-auto w-[78%] transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-5">
              <div className="flex items-baseline justify-between">
                <p className="text-lg font-black text-bb-ink uppercase">
                  {p.label}
                </p>
                <p className="text-sm font-bold text-bb-ink/70">
                  from ${p.subscription.price.toFixed(2)}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {TAGS[p.pack].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-black/[0.05] px-3 py-1 text-[10px] font-bold tracking-[0.08em] text-bb-ink/70 uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </a>
        ))}
      </section>

      <MerchSection id="shop-merch" />

      <WaitlistSection />
      <SiteFooter />
    </main>
  );
}
