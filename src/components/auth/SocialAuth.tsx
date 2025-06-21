"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FaFacebook, FaGithub, FaGoogle, FaTwitter } from "react-icons/fa6";

interface SocialAuthProps {
  className?: string;
}

export default function SocialAuth({ className = "" }: SocialAuthProps) {
  const handleSocialSignIn = async (provider: string) => {
    try {
      await signIn(provider, {
        callbackUrl: "/dashboard", // Redirect to dashboard after successful auth
      });
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
    }
  };

  return (
    <div className={`extra-sign-in-container ${className}`}>
      <p className="social-text text-[#444444] dark:text-[#bbbbbb]">
        Or Continue with social platforms
      </p>
      <div className="social-media">
        <Button
          type="button"
          variant="outline"
          className="social-icon px-0 py-0 text-[#333] dark:text-[#ccc]"
          onClick={() => handleSocialSignIn("facebook")}
          aria-label="Sign in with Facebook"
        >
          <FaFacebook size={24} className="social-icon-svg svg" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="social-icon px-0 py-0 text-[#333] dark:text-[#ccc]"
          onClick={() => handleSocialSignIn("twitter")}
          aria-label="Sign in with Twitter"
        >
          <FaTwitter className="social-icon-svg svg" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="social-icon px-0 py-0 text-[#333] dark:text-[#ccc]"
          onClick={() => handleSocialSignIn("google")}
          aria-label="Sign in with Google"
        >
          <FaGoogle className="social-icon-svg svg" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="social-icon px-0 py-0 text-[#333] dark:text-[#ccc]"
          onClick={() => handleSocialSignIn("github")}
          aria-label="Sign in with GitHub"
        >
          <FaGithub className="social-icon-svg svg" />
        </Button>
      </div>
    </div>
  );
}
