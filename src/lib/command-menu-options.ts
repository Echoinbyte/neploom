import { FaHome } from "react-icons/fa";
import { PiAirplaneLandingFill } from "react-icons/pi";
import { Loomer } from "@/types/Loomer";
import { ComponentType } from "react";
import { IoLogIn } from "react-icons/io5";

interface CommandOption {
  value: string;
  label: string;
  link: string;
  shortCut: string;
  icon: ComponentType<{ size: number }>;
}

interface CommandGroup {
  Heading: string;
  Options: CommandOption[];
}

export const getCommandOptions = (
  loomer: Loomer | null,
  LoomerProfileIcon: ComponentType<{ size: number }>
): CommandGroup[] => {
  const options: CommandGroup[] = [
    {
      Heading: "Pages",
      Options: [
        {
          value: "home",
          label: "Home",
          link: "/home",
          shortCut: "shift h",
          icon: FaHome,
        },
      ],
    },
  ];

  if (loomer?.isVerified) {
    options.push(
      {
        Heading: "Loomer",
        Options: [
          {
            value: "me",
            label: "Your Profile",
            link: `/loomer/hashId/${loomer?.hashId}`,
            shortCut: "shift u",
            icon: LoomerProfileIcon,
          },
        ],
      },
      
    );
  } else {
    options[0].Options.unshift(
      {
        value: "landing",
        label: "Landing",
        link: "/",
        shortCut: "shift l",
        icon: PiAirplaneLandingFill,
      },
      {
        value: "authentication",
        label: "Authentication",
        link: "/authentication",
        shortCut: "shift a",
        icon: IoLogIn,
      }
    );
  }

  return options;
};
