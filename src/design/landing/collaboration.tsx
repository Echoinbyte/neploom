import Image from "next/image";

// Centralized image imports
import { curve1Svg, curve2Svg } from "@/config/imageImports";

export const RightCurve = () => {
  return (
    <div className="hidden absolute top-1/2 left-full w-[10.125rem] -mt-1 ml-10 pointer-events-none xl:block">
      {" "}
      <Image
        priority
        className="dark:invert dark:brightness-0 dark:contrast-100"
        src={curve2Svg}
        width={162}
        height={76}
        alt="Curve 2"
      />
    </div>
  );
};

export const LeftCurve = () => {
  return (
    <div className="hidden absolute top-1/2 right-full w-[21.625rem] -mt-1 mr-10 pointer-events-none xl:block">
      {" "}
      <Image
        priority
        className="dark:invert dark:brightness-0 dark:contrast-100"
        src={curve1Svg}
        width={522}
        height={182}
        alt="Curve 1"
      />
    </div>
  );
};
