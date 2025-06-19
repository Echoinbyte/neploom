import Image from "next/image";
import Link from "next/link";
import { LeftCurve, RightCurve } from "@/design/landing/collaboration";
import Section from "@/components/landing/Section";
import {
  collabContent,
  collabApps,
  collabText,
} from "@/config/constants/landing-page";

const Collaboration = () => {
  return (
    <Section className="" crossesOffset="" id="" customPaddings="py-16" crosses>
      <div className="mx-auto lg:flex">
        <div className="mx-0 flex flex-col justify-center items-center lg:block lg:max-w-[25rem]">
          <h2 className="leading-[2.5rem] md:leading-[2.5rem] text-3xl sm:text-4xl lg:leading-[3.5rem] xl:text-[2rem] xl:leading-tight mb-8 md:mb-12 text-center font-bold">
            NepLoom for Every Bit of Knowledge
          </h2>

          <ul className="max-w-[22rem] mb-8 md:mb-8">
            {collabContent.map((item: { id: string; title: string }) => (
              <li className="mb-1 py-1" key={item.id}>
                <div className="flex items-center">
                  <Image
                    priority
                    src={"/whychooseus/checked.png"}
                    width={24}
                    height={24}
                    alt="checked Image"
                  />
                  <h6 className="font-normal text-[0.9rem] leading-6 md:text-base ml-5">
                    {item.title}
                  </h6>
                </div>
                {/* {item.text && (
                  <p className="font-light text-[0.875rem] leading-6 md:text-base mt-3 text-[#757185]">
                    {item.text}
                  </p>
                )} */}
              </li>
            ))}
          </ul>

          <Link href={"/sign-up"} className="mt-[10px] cursor-pointer">
            <button className="c-cursor-hover py-6 px-6 font-medium text-[18px] text-white dark:text-black bg-[#ef4444] rounded-[10px] outline-none cursor-pointer">
              NepLoom is for Everything
            </button>
          </Link>
        </div>

        <div className="lg:ml-auto xl:w-[38rem] mt-4">
          <p className="font-light text-center text-[0.875rem] leading-6 md:text-base mb-8 text-slate-700 dark:text-slate-300 md:mb-16 lg:mb-32 lg:w-[22rem] lg:mx-auto">
            {collabText}
          </p>

          <div className="relative left-1/2 flex w-[22rem] aspect-square border border-[#252134] dark:border-[#dddae3] rounded-full -translate-x-1/2 scale-75 md:scale-100">
            <div className="flex w-60 aspect-square m-auto border border-[#252134] dark:border-[#dddae3] rounded-full">
              <div
                className="w-[6rem] aspect-square m-auto p-[0.2rem] rounded-full"
                style={{
                  background:
                    "conic-gradient(from 225deg, #FFC876, #79FFF7, #9F53FF, #FF98E2, #FFC876)",
                }}
              >
                <div className="flex items-center justify-center w-full h-full bg-[#F1F3EA] dark:bg-[#0E0C15] rounded-full overflow-hidden">
                  <Image
                    priority
                    src={"/NepLoomAbstract.svg"}
                    width={96}
                    height={96}
                    alt="NepLoom Abstract Logo"
                  />
                </div>
              </div>
            </div>

            <ul>
              {collabApps.map(
                (
                  app: {
                    id: string;
                    title: string;
                    icon: string;
                    width: number;
                    height: number;
                  },
                  index: number
                ) => (
                  <li
                    key={app.id}
                    className={`absolute top-0 left-1/2 h-1/2 -ml-[1.6rem] origin-bottom`}
                    style={{
                      transform: `rotate(${index * 45}deg)`,
                    }}
                  >
                    <div
                      className={`relative -top-[1.6rem] flex w-[3.2rem] h-[3.2rem] bg-n-7 border border-n-1/15 rounded-xl`}
                      style={{
                        transform: `rotate(${index * -45}deg)`,
                      }}
                    >
                      <Image
                        priority
                        className="m-auto"
                        width={app.width}
                        height={app.height}
                        alt={`${app.title} - Application Icon ${index + 1}`}
                        src={app.icon}
                        // loading="lazy"
                      />
                    </div>
                  </li>
                )
              )}
            </ul>

            <LeftCurve />
            <RightCurve />
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Collaboration;
