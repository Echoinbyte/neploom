"use client";

import Link from "next/link";
import { TbDiscount } from "react-icons/tb";
import { ScrollParallax } from "react-just-parallax";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { BackgroundCircles, Gradient } from "@/design/landing/hero";
import { heroIcons } from "@/config/constants/landing-page";
import CircularCallToAction from "@/components/shared/CircularCallToAction";
import Notification from "@/design/landing/notification";
import Generating from "@/design/landing/generating";
import Section from "@/components/landing/Section";

const HeroSection = () => {
  const parallaxRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <section
        id="home"
        className={`flex lg:flex-row flex-col mt-8 sm:mt-0 sm:py-16 py-6`}
      >
        <div
          className={`flex-1 flex justify-center items-start flex-col xl:px-0 sm:px-16 px-6`}
          ref={parallaxRef}
        >
          <div className="flex flex-row items-center py-[3px] px-[2px] sm:py-[6px] sm:px-4 bg-discount-gradient rounded-[10px] mb-2">
            <TbDiscount className="w-8 h-8" />
            <p
              className={`font-normal text-[14px] sm:text-[18px] leading-[30.8px] ml-2`}
            >
              <span className="text-black dark:text-white">
                100%{" "}
                <span className="text-slate-700 dark:text-slate-300">Free</span>{" "}
                Knowledge
              </span>
            </p>
          </div>

          <div className="flex flex-row justify-between items-center w-full">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Expand the <span className="text-gradient">Knowledge</span>
            </h1>
            <div className="sm:flex hidden md:mr-4 mr-0">
              <Link href={"/authentication"}>
                <CircularCallToAction cta="Get Started!" />
              </Link>
            </div>
          </div>
          <p
            className={`font-normal text-slate-700 dark:text-slate-300  text-[18px] leading-[30.8px] max-w-[470px] mt-5`}
          >
            Bloom your knowledge with NepLoom. The only destination for being
            curious and making other curious.
          </p>
        </div>

        <div
          className={`flex-1 flex justify-center items-center md:my-0 my-10 relative`}
        >
          <Image
            priority
            // fill={true}
            src="/landing/expandyourknowledge.png"
            alt="Hero image"
            width={512}
            height={1024}
            // loading="lazy"
            placeholder="blur"
            blurDataURL={"/landing/expandyourknowledge.png"}
            className="w-[100%] h-[100%] relative z-[5]"
          />
        </div>

        <div className={`sm:hidden flex justify-center items-center`}>
          <CircularCallToAction cta="Get Started!" />
        </div>
        <BackgroundCircles parallaxRef={parallaxRef} />
      </section>
      <Section
        crosses
        crossesOffset=""
        customPaddings="py-4"
        className=""
        id="hero"
      >
        <div className="relative max-w-[23rem] mx-auto md:max-w-5xl ">
          <div className="relative z-1 p-0.5 rounded-2xl bg-conic-gradient">
            <div className="relative bg-n-8 rounded-[1rem]">
              <div className="h-[1.4rem] bg-n-10 rounded-t-[0.9rem]" />

              <div className="aspect-[33/20] rounded-b-[0.9rem] overflow-hidden md:aspect-[688/340] lg:aspect-[1024/490]">
                <Image
                  priority
                  src={"/landing/uploadingtheloom.png"}
                  className="w-full scale-[1.7] md:scale-[1]"
                  width={1024}
                  height={490}
                  alt="AI Image"
                  placeholder="blur"
                  // loading="lazy"
                  blurDataURL={"/landing/uploadingtheloom.png"}
                />

                <Generating className="absolute left-4 right-4 bottom-5 md:left-1/2 md:right-auto md:bottom-8 md:w-[31rem] md:-translate-x-1/2 " />

                <ScrollParallax isAbsolutelyPositioned>
                  <ul className="hidden absolute -left-[5.5rem] bottom-[7.5rem] px-1 py-1 bg-n-9/40 backdrop-blur border border-n-1/10 rounded-2xl xl:flex">
                    {heroIcons.map((Icon, index) => (
                      <li className="p-5" key={index}>
                        <Icon
                          className={cn(
                            "w-6 h-6",
                            index == 0 ? "" : "text-white"
                          )}
                        />
                        {/* <Image priority src={icon} width={24} height={25} alt={icon} /> */}
                      </li>
                    ))}
                  </ul>
                </ScrollParallax>

                <ScrollParallax isAbsolutelyPositioned>
                  <Notification
                    className="hidden absolute -right-[5.5rem] bottom-[11rem] w-[18rem] xl:flex"
                    title="New Loom"
                  />
                </ScrollParallax>
              </div>
            </div>

            <Gradient />
          </div>
        </div>
      </Section>
    </>
  );
};

export default HeroSection;
