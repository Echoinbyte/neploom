import { MdArrowOutward } from "react-icons/md";

const CircularCallToAction = ({ cta }: { cta: string }) => (
  <div
    className={`flex justify-center items-center w-[140px] h-[140px] rounded-full group bg-circular-cta-gradient p-[2px] cursor-pointer`}
  >
    <div
      className={`flex justify-center items-center flex-col bg-white dark:bg-black w-[100%] h-[100%] rounded-full`}
    >
      <div className={`flex justify-center items-start flex-row`}>
        <p className="font-medium text-[18px] leading-[23.4px]">
          <span className="text-gradient font-bold">{cta.split(" ")[0]}</span>
        </p>
        <MdArrowOutward className="w-[23px] h-[23px]" />
      </div>

      <p className="font-medium text-[18px] leading-[23.4px]">
        <span className="text-gradient font-bold">{cta.split(" ").slice(1).join(" ")}</span>
      </p>
    </div>
  </div>
);

export default CircularCallToAction;
