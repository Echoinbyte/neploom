import { Loomer } from "@/types/Loomer";

export const CREATION_CATEGORIES = [
  {
    label: "Categories",
    value: "categories" as const,
    featured: [
      {
        name: "Looms",
        href: `/home?category=looms`,
        imageSrc: "/nav/looms.jpg",
      },
      {
        name: "Quicks",
        href: "/home?category=quicks",
        imageSrc: "/nav/quicks.jpg",
      },
      {
        name: "Comets",
        href: "/home?category=comets",
        imageSrc: "/nav/comets.jpg",
      },
      {
        name: "Novas",
        href: "/home?category=novas",
        imageSrc: "/nav/novas.jpg",
      },
    ],
  },
];

export const DEFAULT_LOOMER_DATA: Loomer = {
  loomerName: "Guest",
  hashId: "guest",
  email: "guest@example.com",
  profileAvatar: "/placeholder-loomer.jpg",
  profileAvatarFallback: "GT",
  role: "guest",
  hasOnboarded: false,
  profile: {
    stats: {
      aura: 0,
    },
  },
  isVerified: false,
};
