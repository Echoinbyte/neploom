"use client";

import "@/styles/authentication-page-styles.css";
import log from "../../../../public/auth/log.svg";
import reg from "../../../../public/auth/register.svg";
import { MdOutlineMail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { FormItem, FormMessage } from "@/components/ui/form";
import SimpleSubmitButton from "@/components/auth/SimpleSubmitButton";
import PasswordToggle from "@/components/auth/PasswordToggle";
import SocialAuth from "@/components/auth/SocialAuth";
import ModeToggle from "@/components/auth/ModeToggle";
import UsernameField from "@/components/auth/UsernameField";
import MaxWidthWrapper from "@/components/shared/MaxWidthWrapper";
import SpaceBackground from "@/design/auth/SpaceBackground";
import { signInAction, signUpAction } from "./actions";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthContent() {
  const searchParams = useSearchParams();
  const isSignUpMode = searchParams.get("mode") === "signup";
  const error = searchParams.get("error");
  const success = searchParams.get("success");

  return (
    <MaxWidthWrapper>
      <SpaceBackground />
      <div className={cn("container", isSignUpMode ? "sign-up-mode" : "")}>
        <div className="forms-container">
          <div className="signin-signup">
            {/* Sign In Form */}
            <form action={signInAction} className="sign-in-form">
              <h2 className="title text-black dark:text-white">Sign in</h2>
              {error === "signin-failed" && (
                <FormMessage>
                  Sign in failed. Please check your credentials.
                </FormMessage>
              )}{" "}
              <FormItem>
                <div className="input-field bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <MdOutlineMail className="icon text-gray-600 dark:text-gray-300" />
                  <input
                    name="identifier"
                    type="text"
                    placeholder="Email or Username"
                    className="text-gray-800 dark:text-gray-50 bg-transparent focus:outline-none"
                    required
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
                  />
                </div>
              </FormItem>{" "}
              <FormItem>
                <PasswordToggle
                  fieldName="password"
                  placeholder="Password"
                  icon={
                    <RiLockPasswordLine className="icon text-gray-600 dark:text-gray-300" />
                  }
                />{" "}
              </FormItem>
              <SimpleSubmitButton>Sign In</SimpleSubmitButton>
              <SocialAuth />
            </form>

            {/* Sign Up Form */}
            <form action={signUpAction} className="sign-up-form">
              <h2 className="title text-black dark:text-white">Sign up</h2>
              {error === "signup-failed" && (
                <FormMessage>Sign up failed. Please try again.</FormMessage>
              )}
              {success === "signup-complete" && (
                <FormMessage className="text-green-500">
                  Account created successfully!
                </FormMessage>
              )}
              <FormItem>
                <UsernameField />
              </FormItem>{" "}
              <FormItem>
                <div className="input-field bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <MdOutlineMail className="icon text-gray-600 dark:text-gray-300" />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    className="text-gray-800 dark:text-gray-50 bg-transparent focus:outline-none"
                    required
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
                  />
                </div>
              </FormItem>{" "}
              <FormItem>
                <PasswordToggle
                  fieldName="password"
                  placeholder="Password"
                  icon={
                    <RiLockPasswordLine className="icon text-gray-600 dark:text-gray-300" />
                  }
                />{" "}
              </FormItem>
              <SimpleSubmitButton>Sign Up</SimpleSubmitButton>
              <SocialAuth />
            </form>

            {/* <SocialAuth /> */}
          </div>
        </div>
        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <h3>Are you new here ?</h3>
              <p>
                Don&apos;t worry, we got your back. Just sign up and start your
                journey
              </p>
              <ModeToggle mode="signup">Sign up</ModeToggle>
            </div>
            <Image priority src={log} className="image" alt="Logging" />
          </div>
          <div className="panel right-panel">
            <div className="content">
              <h3>Already one of us ?</h3>
              <p>Just sign in and continue your journey with us</p>
              <ModeToggle mode="signin">Sign in</ModeToggle>
            </div>
            <Image priority src={reg} className="image" alt="Register" />{" "}
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
