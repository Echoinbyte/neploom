import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import FacebookProvider from "next-auth/providers/facebook";
import LinkedInProvider from "next-auth/providers/linkedin";
import TwitterProvider from "next-auth/providers/twitter";
import { createServerClient } from "@/supabase/server";
import axios from "axios";

// Extended user type for internal use
interface ExtendedUser extends User {
  customUserData?: UserData;
  id: string;
  hashId: string;
  loomerName: string;
  isVerified: boolean;
  onboardingCompleted: boolean;
  role: string;
  avatar?: string;
}

interface UserData {
  id: string;
  hash_id: string;
  loomer_name: string;
  is_verified: boolean;
  onboarding_completed: boolean;
  role: string;
  avatar?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Record<string, string> | undefined
      ): Promise<User | null> {
        try {
          if (!credentials?.identifier || !credentials?.password) {
            return null;
          }

          const supabase = await createServerClient();

          // Call the authenticate_user RPC function
          const { data, error } = await supabase.rpc("authenticate_user", {
            p_identifier: credentials.identifier,
            p_password: credentials.password,
          });

          if (error) {
            console.error("Authentication error:", error);
            return null;
          }

          if (!data.success) {
            return null;
          }

          // Return user data in NextAuth User format with consistent camelCase
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.loomer_name,
            image: data.user.avatar,
            hashId: data.user.hash_id,
            loomerName: data.user.loomer_name,
            isVerified: data.user.is_verified,
            onboardingCompleted: data.user.onboarding_completed,
            role: data.user.role,
            avatar: data.user.avatar,
          } as ExtendedUser;
        } catch (err: unknown) {
          console.error("Authorization error:", err);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") {
        const { email, name, image } = user;
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/one-click-login`,
            {
              name,
              email,
              image,
            }
          );
          if (response.data.success) {
            user.customUserData = response.data.user;
            return true;
          } else {
            console.error(
              "Error during one-click-login:",
              response.data.message
            );
            return false;
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error("Error during one-click-login:", error.message);
          } else {
            console.error("Error during one-click-login:", error);
          }
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        const extendedUser = user as ExtendedUser;

        // Handle social login users vs credential users
        if (extendedUser.customUserData) {
          // Social login - data comes from API in snake_case
          const userData = extendedUser.customUserData;
          token.id = userData.id;
          token.hashId = userData.hash_id;
          token.username = userData.loomer_name;
          token.isVerified = userData.is_verified;
          token.onboardingCompleted = userData.onboarding_completed;
          token.role = userData.role;
          token.avatar = userData.avatar;
        } else {
          // Credential login - data already converted to camelCase
          token.id = extendedUser.id;
          token.hashId = extendedUser.hashId;
          token.username = extendedUser.loomerName;
          token.isVerified = extendedUser.isVerified;
          token.onboardingCompleted = extendedUser.onboardingCompleted;
          token.role = extendedUser.role;
          token.avatar = extendedUser.avatar;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.hashId = token.hashId as string;
        session.user.isVerified = token.isVerified as boolean;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.profileAvatar = token.avatar as string;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/authentication",
  },
};
