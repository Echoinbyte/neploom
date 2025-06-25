// Types for NextAuth configuration and authentication
export interface Credentials {
  identifier: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  loomer_name: string;
  hash_id: string;
  avatar: string;
  role: string;
  is_verified: boolean;
  onboarding_completed: boolean;
  stardust?: number;
  level?: number;
  xp?: number;
  aura?: number;
  bio?: string;
  location?: string;
  interests?: string[];
  dislikes?: string[];
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
  message?: string;
}

export interface SocialUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  customUserData?: AuthUser;
}

export interface JWTToken {
  id?: string;
  isVerified?: boolean;
  hashId?: string;
  username?: string;
  onboardingCompleted?: boolean;
  role?: string;
  avatar?: string;
  profileAvatar?: string;
  profileAvatarFallback?: string;
}

export interface CustomSession {
  user: {
    id?: string;
    email?: string;
    name?: string;
    image?: string;
    hashId?: string;
    isVerified?: boolean;
    username?: string;
    role?: string;
    profileAvatar?: string;
    profileAvatarFallback?: string;
  };
}
