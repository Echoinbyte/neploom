import "next-auth";
import { DefaultSession } from "next-auth";
import { Loomer } from "./Loomer";

interface UserData {
  id: string;
  hash_id: string;
  loomer_name: string;
  is_verified: boolean;
  onboarding_completed: boolean;
  role: "guest" | "user" | "author" | "admin" | "time";
  avatar?: string;
  stardust?: number;
  aura?: number;
  level?: number;
  xp?: number;
}

declare module "next-auth" {
  interface Session {
    user: Loomer & DefaultSession["user"];
  }

  interface User {
    id: string;
    hashId: string;
    isVerified: boolean;
    loomerName: string;
    role: "guest" | "user" | "author" | "admin" | "time";
    avatar?: string;
    onboardingCompleted: boolean;
    stardust?: number;
    aura?: number;
    level?: number;
    xp?: number;
    customUserData?: UserData;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    hashId: string;
    isVerified: boolean;
    loomerName: string;
    role: "guest" | "user" | "author" | "admin" | "time";
    avatar?: string;
    onboardingCompleted: boolean;
    stardust: number;
    aura: number;
    level: number;
    xp: number;
  }
}
