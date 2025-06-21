import TagLine from "@/design/landing/tagline";
import Section from "@/components/landing/Section";
import Image from "next/image";
import Link from "next/link";
import CircularCallToAction from "@/components/shared/CircularCallToAction";

const Pricing = () => {
  return (
    <>
      <Section
        className=""
        id="pricings"
        crosses
        crossesOffset=""
        customPaddings="py-8"
      >
        <div className="relative z-2">
          <div className="relative justify-center mb-[6.5rem] flex">
            <Image
              priority
              src={"/knowledgesphere.png"}
              className="relative z-1"
              width={255}
              height={255}
              alt="Sphere"
            />
            <div className="absolute top-1/2 left-1/2 w-[60rem] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <Image
                priority
                src={"/pricing/stars.svg"}
                className="w-full"
                width={950}
                height={400}
                alt="Stars"
              />
            </div>
          </div>
          <TagLine className="mb-[3rem] justify-center">
            Get started with NepLoom For Free
          </TagLine>
          <div className="w-full flex justify-center items-center">
            <Link href={"/authentication"}>
              <CircularCallToAction cta="Learn Now!" />
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
};

export default Pricing;
