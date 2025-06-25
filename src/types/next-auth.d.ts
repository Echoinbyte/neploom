import "next-auth";
import { DefaultSession } from "next-auth";

interface UserData {
  id: string;
  hash_id: string;
  loomer_name: string;
  is_verified: boolean;
  onboarding_completed: boolean;
  role: string;
  avatar?: string;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      hashId: string;
      isVerified: boolean;
      username: string;
      role: string;
      profileAvatar?: string;
      onboardingCompleted: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    hashId: string;
    isVerified: boolean;
    loomerName: string;
    role: string;
    avatar?: string;
    onboardingCompleted: boolean;
    customUserData?: UserData;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    hashId: string;
    isVerified: boolean;
    username: string;
    role: string;
    avatar?: string;
    onboardingCompleted: boolean;
  }
}
