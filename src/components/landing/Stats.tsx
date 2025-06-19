import { stats } from "@/config/constants/landing-page";
import Section from "./Section";

const Stats = () => (
  <Section
    crosses
    crossesOffset=""
    customPaddings="pt-4"
    // customPaddings=""
    id="stats"
    className=""
  >
    <section className="flex justify-center items-center flex-row flex-wrap">
    {stats.map((stat: { id: string; title: string; value: string }) => (
      <div
        key={stat.id}
        className={`flex-1 flex justify-start items-center flex-row m-3`}
      >
        <h4 className="font-semibold xs:text-[40.89px] lg:text-[30.89px] md:text-2xl text-xl xs:leading-[53.16px] leading-[43.16px] text-black dark:text-white">
          {stat.value}
        </h4>
        <p className="font-normal xs:text-[20.45px] lg:text-[15.45px] text-sm xs:leading-[26.58px] leading-[21.58px] text-gradient uppercase ml-3">
          {stat.title}
        </p>
      </div>
    ))}
    </section>
  </Section>
);

export default Stats;
