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
  loomerName: "Guest",
  hashId: "00000000",
  email: "guest@example.com",
  avatar: "/placeholder-loomer.jpg",
  role: "guest",
  onboardingCompleted: false,
  profile: {
    stats: {
      aura: 0,
    },
  },
  isVerified: false,
};
