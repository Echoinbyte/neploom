import { Loomer } from "@/types/Loomer";

export const CREATION_CATEGORIES = [
  {
    label: "Categories",
    value: "categories" as const,
    featured: [
      {
        name: "Looms",
        href: `/home?category=looms`,
        imageSrc: "/navigation/looms.png",
      },
      {
        name: "Quicks",
        href: "/home?category=quicks",
        imageSrc: "/navigation/quicks.png",
      },
      {
        name: "Comets",
        href: "/home?category=comets",
        imageSrc: "/navigation/comets.png",
      },
      {
        name: "Novas",
        href: "/home?category=novas",
        imageSrc: "/navigation/novas.png",
      },
    ],
  },
];

export const DEFAULT_LOOMER_DATA: Loomer = {
  id: "",
  loomerName: "Guest",
  hashId: "00000000",
  avatar: "/placeholder-loomer.jpg",
  role: "guest",
  onboardingCompleted: false,
  stardust: 0,
  aura: 0,
  level: 0,
  xp: 0,
  isVerified: false,
};
