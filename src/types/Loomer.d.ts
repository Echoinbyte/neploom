export type Loomer = {
  id: string;
  loomerName: string;
  hashId: string;
  avatar: string;
  role: "guest" | "user" | "author" | "admin" | "time";
  onboardingCompleted: boolean;
  stardust: number;
  aura: number;
  level: number;
  xp: number;
  isVerified: boolean;
};
