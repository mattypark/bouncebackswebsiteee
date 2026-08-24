import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NavBar from "@/components/NavBar";
import ProductDetail from "@/components/ProductDetail";
import WaitlistSection from "@/components/WaitlistSection";
import SiteFooter from "@/components/SiteFooter";
import { PACKS, type Pack } from "@/lib/shopify-products";

export function generateStaticParams() {
  return PACKS.map((p) => ({ pack: p.pack }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pack: string }>;
}): Promise<Metadata> {
  const { pack } = await params;
  const product = PACKS.find((p) => p.pack === pack);
  return {
    title: product
      ? `BB-1 ${product.label} — BounceBack Pickle`
      : "Shop — BounceBack Pickle",
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ pack: string }>;
}) {
  const { pack } = await params;
  const product = PACKS.find((p) => p.pack === pack);
  if (!product) notFound();

  return (
    <main className="bg-bb-paper">
      <NavBar variant="dark" />
      <ProductDetail pack={pack as Pack} />
      <WaitlistSection />
      <SiteFooter />
    </main>
  );
}
