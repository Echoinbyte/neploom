"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { MouseParallax } from "react-just-parallax";

export const Gradient = () => {
  return (
    <>
      <div className="relative z-1 h-6 mx-2.5 shadow-xl dark:shadow-gray-500/40 rounded-b-[1.25rem] lg:h-6 lg:mx-8" />
      <div className="relative z-1 h-6 mx-6 shadow-xl dark:shadow-gray-500/40 rounded-b-[1.25rem] lg:h-6 lg:mx-20" />
    </>
  );
};

export const BottomLine = () => {
  return (
    <>
      <div className="hidden absolute top-[55.25rem] left-10 right-10 h-0.25 bg-gray-300 dark:bg-gray-600 pointer-events-none xl:block" />

      <Plus className="hidden absolute top-[54.9375rem] left-[2.1875rem] z-2 pointer-events-none xl:block" />

      <Plus className="hidden absolute top-[54.9375rem] right-[2.1875rem] z-2 pointer-events-none xl:block" />
    </>
  );
};

const Rings = () => {
  return (
    <>
      <div className="absolute top-1/2 left-1/2 w-[65.875rem] aspect-square border border-gray-600/20 dark:border-gray-200/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-[51.375rem] aspect-square border border-gray-600/20 dark:border-gray-200/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-[36.125rem] aspect-square border border-gray-600/20 dark:border-gray-200/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-[23.125rem] aspect-square border border-gray-600/20 dark:border-gray-200/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
    </>
  );
};

export const BackgroundCircles = ({
  parallaxRef,
}: {
  parallaxRef: React.RefObject<HTMLElement | null>;
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="absolute -top-[28rem] left-1/2 hidden sm:flex sm:w-[620px] md:w-[750px] lg:w-[1000px]  xl:w-[78rem] aspect-square border border-gray-200/5 dark:border-gray-600/5 rounded-full -translate-x-1/2 sm:-top-[0rem] md:-top-[0rem] xl:-top-[0rem] -z-10">
      <Rings />

      {/* Moving background colored circle balls */}
      <MouseParallax strength={0.07} parallaxContainerRef={parallaxRef}>
        
        <div className="absolute bottom-1/2 left-1/2 w-0.25 h-1/2 origin-bottom rotate-[46deg]">
          <div
            className={`w-2 h-2 -ml-1 -mt-36 bg-gradient-to-b from-orange-400 to-gray-800 dark:from-orange-300 dark:to-gray-200 rounded-full transition-transform duration-500 ease-out ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          />
        </div>
        <div className="absolute bottom-1/2 left-1/2 w-0.25 h-1/2 origin-bottom -rotate-[56deg]">
          <div
            className={`w-4 h-4 -ml-1 -mt-32 bg-gradient-to-b from-orange-400 to-gray-800 dark:from-orange-300 dark:to-gray-200 rounded-full transition-transform duration-500 ease-out ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          />
        </div>
        <div className="absolute bottom-1/2 left-1/2 w-0.25 h-1/2 origin-bottom rotate-[54deg]">
          <div
            className={`hidden w-4 h-4 -ml-1 mt-[12.9rem] bg-gradient-to-b from-purple-300 to-gray-800 dark:from-purple-200 dark:to-gray-200 rounded-full xl:block transit transition-transform duration-500 ease-out ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          />
        </div>
        <div className="absolute bottom-1/2 left-1/2 w-0.25 h-1/2 origin-bottom -rotate-[65deg]">
          <div
            className={`w-3 h-3 -ml-1.5 mt-52 bg-gradient-to-b from-purple-300 to-gray-800 dark:from-purple-200 dark:to-gray-200 rounded-full transition-transform duration-500 ease-out ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          />
        </div>
        <div className="absolute bottom-1/2 left-1/2 w-0.25 h-1/2 origin-bottom -rotate-[85deg]">
          <div
            className={`w-6 h-6 -ml-3 -mt-3 bg-gradient-to-b from-emerald-300 to-gray-800 dark:from-emerald-200 dark:to-gray-200 rounded-full transition-transform duration-500 ease-out ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          />
        </div>
        <div className="absolute bottom-1/2 left-1/2 w-0.25 h-1/2 origin-bottom rotate-[70deg]">
          <div
            className={`w-6 h-6 -ml-3 -mt-3 bg-gradient-to-b from-emerald-300 to-gray-800 dark:from-emerald-200 dark:to-gray-200 rounded-full transition-transform duration-500 ease-out ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          />
        </div>
      </MouseParallax>
    </div>
  );
};
