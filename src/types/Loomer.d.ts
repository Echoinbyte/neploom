export type Loomer = {
  loomerName: string;
  hashId: string;
  email: string;
  profileAvatar: string;
  profileAvatarFallback: string;
  role: "guest" | "user" | "author" | "admin" | "time";
  hasOnboarded: boolean;
  profile: {
    stats: {
      aura: number;
    };
  };
  isVerified: boolean;
};
