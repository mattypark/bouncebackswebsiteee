import HeroSection from "@/components/HeroSection";
import TextRevealSection from "@/components/TextRevealSection";
import WasteStatSection from "@/components/WasteStatSection";
import RecycledRevealSection from "@/components/RecycledRevealSection";
import TheProcessSection from "@/components/TheProcessSection";
import WhyChooseSection from "@/components/WhyChooseSection";

import WaitlistSection from "@/components/WaitlistSection";
import SmoothScroll from "@/components/SmoothScroll";
import PreorderPacksSection from "@/components/PreorderPacksSection";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <HeroSection />
      {/* Gradient canvas — packs + storytelling share one clean gradient */}
      <div className="bb-gradient w-full">
        {/* BB-1 preorder packs — also on /bb-1 */}
        <div className="w-full pt-16 md:pt-20">
          <PreorderPacksSection id="preorder-home" heading="Preorder the BB-1." />
        </div>
        {/* Storytelling slides */}
        <TextRevealSection
          id="slide-problem"
          glass
          text="There's a major problem in the Pickleball community."
        />
        <WasteStatSection />
        <TextRevealSection
          id="slide-solution"
          text="So what did we do?"
          className="flex w-full items-center justify-center py-24 pb-32 md:py-32 md:pb-40"
        />
        <RecycledRevealSection />
      </div>
      <TheProcessSection />
      <WhyChooseSection />
      <WaitlistSection />
    </>
  );
}
