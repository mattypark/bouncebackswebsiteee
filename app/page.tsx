import HeroSection from "@/components/HeroSection";
import WasteStatSection from "@/components/WasteStatSection";
import TheProcessSection from "@/components/TheProcessSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import ComparisonSection from "@/components/ComparisonSection";

import WaitlistSection from "@/components/WaitlistSection";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <>
      <HeroSection />
      {/* Storytelling slides */}
      <WasteStatSection />
      <TheProcessSection />
      <WhyChooseSection />
      <ComparisonSection />
      <WaitlistSection />
      <SiteFooter />
    </>
  );
}
