import { ReactNode } from "react";

const Section = ({
  className = "",
  id = "",
  crosses = true,
  crossesOffset = "",
  customPaddings = "",
  children = "",
}: {
  className: string;
  id: string;
  crosses: boolean;
  crossesOffset: string;
  customPaddings: string;
  children: ReactNode;
}) => {
  return (
    <div
      id={id}
      className={`
      relative
      ${
        customPaddings ||
        `py-10 lg:py-16 xl:py-20 ${crosses ? "lg:py-32 xl:py-40" : ""}`
      } 
      ${className}`}
    >
      {children}

      {crosses && (
        <>
          <Crosses crossesOffset={crossesOffset} />
        </>
      )}
    </div>
  );
};

export default Section;

export const Crosses = ({ crossesOffset }: { crossesOffset: string }) => {
  return (
    <div className="mt-4">
      <svg
        className={`left-0 absolute -top-[0.3125rem] lg:left-[1.5625rem] ${crossesOffset} pointer-events-none block xl:left-[2.1875rem]`}
        width="11"
        height="11"
        fill="none"
      >
        <path
          d="M7 1a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v2a1 1 0 0 1-1 1H1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h2a1 1 0 0 1 1 1v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V8a1 1 0 0 1 1-1h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H8a1 1 0 0 1-1-1V1z"
          fill="#ada8c4"
        />
      </svg>
      {/* Dotted horizontal line connecting the two crosses */}
      <svg
        className={`absolute -top-[0.3125rem]  pointer-events-none block w-full`}
        height="11"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 100 11"
      >
        <line
          x1="0"
          y1="5.5"
          x2="100"
          y2="5.5"
          stroke="#ada8c4"
          strokeWidth="1"
          strokeDasharray="2,3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <svg
        className={`right-0 absolute -top-[0.3125rem] lg:right-[1.5625rem] ${crossesOffset} pointer-events-none block xl:right-[2.1875rem]`}
        width="11"
        height="11"
        fill="none"
      >
        <path
          d="M7 1a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v2a1 1 0 0 1-1 1H1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h2a1 1 0 0 1 1 1v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V8a1 1 0 0 1 1-1h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H8a1 1 0 0 1-1-1V1z"
          fill="#ada8c4"
        />
      </svg>
    </div>
  );
};
