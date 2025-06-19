import Image from "next/image";

export const Gradient = () => {
  return (
    <div className="absolute top-0 -left-[10rem] opacity-50 mix-blend-color-dodge pointer-events-none">
      <Image
        priority
        className="absolute top-1/2 left-1/2  -translate-x-1/2 -translate-y-1/2"
        src={"/gradient.png"}
        width={1417}
        height={1417}
        alt="Gradient"
      />
    </div>
  );
};

export const PhotoChatMessage = () => {
  return (
    <div
      className={
        "absolute right-8 max-w-[17.5rem] py-6 px-8 bg-white  dark:bg-black rounded-t-xl rounded-bl-xl font-code text-base lg:right-[8.75rem] lg:max-w-[17.5rem] text-black dark:text-white top-8 lg:top-16"
      }
    >
      Hey friend, It would be great if you start a community about Technology
      {/* <ChatBubbleWing
        pathClassName=""
        className="absolute left-full bottom-0"
      /> */}
    </div>
  );
};

export const VideoChatMessage = () => {
  return (
    <div
      className="absolute top-8 left-[3.125rem] w-full max-w-[14rem] bg-white  dark:bg-black pt-2.5 pr-2.5 pb-7 pl-5 bg-n-6 rounded-t-xl rounded-br-xl font-code text-base md:max-w-[17.5rem] text-black dark:text-white"
    >
      Be Innovative
      <p className="tagline absolute right-2.5 bottom-1 text-[0.625rem] text-n-3 uppercase">
        Just Now!
      </p>
    </div>
  );
};

export const VideoBar = () => {
  return (
    <div className="absolute left-0 bottom-0 w-full flex items-center p-6">
        <Image
          priority
          src={"/play.svg"}
          width={24}
          height={24}
          alt="Play"
          className="object-contain mr-3"
        />

      <div className={"flex-1 bg-[#D9D9D9]"}>
        <div
          className={"h-0.5 bg-[#ee1212] w-1/5"}
        ></div>
      </div>
    </div>
  );
};
