import { Loomer } from "@/types/Loomer";

export const CREATION_CATEGORIES = [
  {
    label: "Categories",
    value: "categories" as const,
    featured: [
      {
        name: "Technology",
        href: `/creation?tag=technology`,
        imageSrc: "/nav/technology/technology.jpg",
      },
      {
        name: "Business",
        href: "/creation?tag=business",
        imageSrc: "/nav/business/business.jpg",
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
  isVerified: false
};
