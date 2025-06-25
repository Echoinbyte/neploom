export type Loomer = {
  loomerName: string;
  hashId: string;
  email: string;
  avatar: string;
  role: "guest" | "user" | "author" | "admin" | "time";
  onboardingCompleted: boolean;
  profile: {
    stats: {
      aura: number;
    };
  };
  isVerified: boolean;
};
