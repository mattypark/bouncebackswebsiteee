import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import ProductDetail from "@/components/ProductDetail";
import WaitlistSection from "@/components/WaitlistSection";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "BB-1 — BounceBack Pickle",
  description:
    "BB-1 recycled performance pickleballs. Pro spec, closed-loop, subscribe & save.",
};

export default function BB1Page() {
  return (
    <main className="bg-bb-paper">
      <NavBar variant="dark" />
      <ProductDetail pack="12" />
      <WaitlistSection />
      <SiteFooter />
    </main>
  );
}
