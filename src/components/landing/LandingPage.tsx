import "@/styles/landing-page-styles.css"
import MaxWidthWrapper from "@/components/shared/MaxWidthWrapper";
import Stats from "@/components/landing/Stats";
import Benefits from "@/components/landing/Benefits";
import Collaboration from "@/components/landing/Collaboration";
import Pricing from "@/components/landing/Pricing";
import HeroSection from "@/components/landing/HeroSection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <MaxWidthWrapper className="max-w-screen-xl">
        <div className={`w-full`}>
          <div className={`w-full`}>
            <HeroSection></HeroSection>
          </div>
        </div>
        <div className={`flex justify-center items-center`}>
          <div className={`w-full`}>
            <Stats></Stats>
            <Benefits></Benefits>
            <Collaboration></Collaboration>
            {/* <Services></Services> */}
            <Pricing></Pricing>
          </div>
        </div>
        <Footer></Footer>
      </MaxWidthWrapper>
    </>
  );
}
