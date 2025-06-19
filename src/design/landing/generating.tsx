import { VscLoading } from "react-icons/vsc";

const Generating = ({ className = "" }: { className: string }) => {
  return (
    <div
      className={`flex items-center h-[3.5rem] px-6 bg-[#F1F3EA]/80 dark:bg-[#0E0C15]/80 rounded-[1.7rem] text-base text-black dark:text-white ${className}`}
    >
      <VscLoading className={"w-5 h-5 mr-4 transform ease-in-out"} />
      Uploading the Loom
    </div>
  );
};

export default Generating;
