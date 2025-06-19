import Image from "next/image";
import Section from "@/components/landing/Section";
import { benefits } from "@/config/constants/landing-page";
import { GradientLight } from "@/design/landing/benefits";

const Benefits = () => {
  return (
    <Section
      id="features"
      className=""
      crosses
      crossesOffset=""
      customPaddings="pt-8 pb-4"
    >
      <div className="mt-2 relative z-[2] flex flex-col justify-center items-center gap-6">
        {" "}
        <h2 className="text-3xl leading-[2.5rem] sm:text-4xl md:leading-[2.5rem] lg:text-5xl lg:leading-[3.5rem] xl:text-6xl xl:leading-tight text-center font-bold flex flex-wrap justify-center items-center gap-2">
          <span>Think Smarter with</span>
          <span className="flex items-center">
            <Image
              priority
              src={"/NepLoomRed.svg"}
              width={32}
              height={32}
              alt="NepLoom Logo"
              className="ml-2 w-22 h-22 sm:w-28 sm:h-28 md:w-28 md:h-28 lg:w-38 lg:h-38 xl:w-48 xl:h-48 inline-block"
            />
          </span>
        </h2>
        <div className="grid flex-wrap gap-10 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mb-10 mt-10">
          {benefits?.map(
            (Item: {
              id: string;
              title: string;
              text: string;
              iconUrl?: string;
              imageUrl?: string;
              backgroundUrl?: string;
            }) => {
              return (
                <div
                  className="block relative bg-no-repeat bg-[length:100%_100%] max-w-[24rem] md:max-w-[20rem]"
                  style={{
                    backgroundImage: `url(${Item.backgroundUrl})`,
                  }}
                  key={Item.id}
                >
                  <div className="relative z-[2] flex flex-col min-h-[22rem] p-[2.4rem] pointer-events-none">
                    <h5 className="text-2xl leading-normal mb-5">
                      {Item.title}
                    </h5>
                    <p className="font-light text-[0.875rem] leading-6 md:text-base mb-6  text-slate-700 dark:text-slate-300">
                      {Item.text}
                    </p>
                    <div className="flex items-center mt-auto">
                      <Image
                        priority
                        src={Item.iconUrl || "/placeholder.svg"}
                        // className="h-auto w-auto"
                        width={48}
                        height={48}
                        alt={Item.title || "Item iconURL"}
                        placeholder="blur"
                        blurDataURL={Item.iconUrl || "/placeholder.svg"}
                        // loading="lazy"
                      />
                      <p className="ml-auto font-code text-xs font-bold uppercase tracking-wider">
                        For 100% Free
                      </p>
                    </div>
                  </div>

                  <GradientLight />

                  <div
                    className="absolute inset-0.5"
                    style={{ clipPath: "url(#benefits)" }}
                  >
                    <div className="absolute inset-0 opacity-0 transition-opacity hover:opacity-10">
                      {Item.imageUrl && (
                        // <FaIdeal />
                        // <Item.ImageUrl className="w-[380px] h-[362px]"></Item.ImageUrl>
                        <Image
                          priority
                          src={Item.imageUrl || "/benefits/image-2.png"}
                          width={380}
                          height={362}
                          alt={Item.title}
                          className="w-full h-full object-cover"
                          placeholder="blur"
                          blurDataURL={"/benefits/image-2.png"}
                          // loading="lazy"
                        />
                      )}
                    </div>
                  </div>

                  <svg className="block" width={0} height={0}>
                    <clipPath id="benefits" clipPathUnits="objectBoundingBox">
                      <path d="M0.079,0 h0.756 a0.079,0.083,0,0,1,0.058,0.026 l0.086,0.096 A0.079,0.083,0,0,1,1,0.179 V0.917 c0,0.046,-0.035,0.083,-0.079,0.083 H0.079 c-0.044,0,-0.079,-0.037,-0.079,-0.083 V0.083 C0,0.037,0.035,0,0.079,0" />
                    </clipPath>
                  </svg>
                </div>
              );
            }
          )}
        </div>
      </div>
    </Section>
  );
};

export default Benefits;
