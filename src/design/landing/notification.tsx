import { notificationImages } from "@/config/constants/landing-page";
import Image from "next/image";
import React from "react";

const Notification = ({
  className = "",
  title,
}: {
  className: string;
  title: string;
}) => {
  return (
    <div
      className={`${className} flex items-center p-4 pr-6 bg-n-9/40 backdrop-blur border border-n-1/10 rounded-2xl gap-5`}
    >
      <Image
        priority
        src="/NepLoom.svg"
        alt="NepLoom Logo"
        className="h-[62px] w-[62px] rounded-xl"
        height={62}
        width={62}
        placeholder="blur"
        // loading="lazy"
        blurDataURL={"/NepLoom.svg"}
      />
      {/* <BiNotification className="h-[62px] w-[62px] rounded-xl" /> */}

      <div className="flex-1">
        <h6 className="mb-1 font-semibold text-base text-white">{title}</h6>

        <div className="flex items-center justify-between">
          <ul className="flex -m-0.5">
            {notificationImages.map((Icon: React.ElementType, index: number) => (
              <li
                key={index}
                className="flex w-6 h-6 border-2 border-n-12 rounded-full overflow-hidden"
              >
                <Image
                  priority
                  src={"/placeholder-user.jpg"}
                  className="w-full"
                  width={20}
                  height={20}
                  alt={`Users ${index + 1} - Image`}
                  // loading="lazy"
                />
                {/* <Icon className="w-5 h-5"></Icon> */}
              </li>
            ))}
          </ul>
          <div className="body-2 text-n-13">Just Now!</div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
