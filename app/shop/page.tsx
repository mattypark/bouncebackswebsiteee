import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import MerchSection from "@/components/MerchSection";

export const metadata: Metadata = {
  title: "Shop — BounceBack",
  description:
    "BounceBack apparel and merch. Wear the movement — recycled pickleball, built for players, designed for the planet.",
};

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-bb-cream text-bb-deep">
      <NavBar variant="dark" />

      <main className="bb-gradient w-full pt-28 pb-8 md:pt-32">
        <div className="mx-auto mb-4 max-w-6xl px-6 text-center md:px-12 lg:px-16">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-bb-deep/60">
            BounceBack Shop
          </p>
        </div>
        <MerchSection id="shop" heading="Wear the movement." />
      </main>
    </div>
  );
}
