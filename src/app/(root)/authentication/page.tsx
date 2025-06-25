import "@/styles/authentication-page-styles.css";
import { log, reg } from "@/config/imageImports";
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
import { signInAction } from "@/actions/authentication/signInActions";
import { signUpAction } from "@/actions/authentication/signUpActions";
import { redirect } from "next/navigation";
import type { RedirectData } from "@/types/api.types";
// import { Suspense } from "react";

interface Params {
  mode?: string;
  error?: string;
  message?: string;
  success?: string;
}

export default async function AuthContent({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const { mode, error, message, success } = await searchParams;
  const isSignUpMode = mode === "signup" ? true : false;

  const signInActionHandler = async (formData: FormData) => {
    "use server";
    const response = await signInAction(formData);

    if (response.success) {
      const redirectTo = (response.data as RedirectData)?.redirectTo || "/home";
      redirect(redirectTo);
    } else {
      const redirectTo =
        (response.data as RedirectData)?.redirectTo ||
        "/authentication?error=signin-failed";
      redirect(redirectTo);
    }
  };

  const signUpActionHandler = async (formData: FormData) => {
    "use server";
    const response = await signUpAction(formData);

    if (response.success) {
      const redirectTo =
        (response.data as RedirectData)?.redirectTo || "/verifyEmail";
      redirect(redirectTo);
    } else {
      const redirectTo =
        (response.data as RedirectData)?.redirectTo ||
        "/authentication?error=signup-failed&mode=signup";
      redirect(redirectTo);
    }
  };

  return (
    <MaxWidthWrapper>
      <SpaceBackground />
      <div className={cn("container", isSignUpMode ? "sign-up-mode" : "")}>
        <div className="forms-container">
          <div className="signin-signup">
            {/* Sign In Form */}
            <form action={signInActionHandler} className="sign-in-form">
              <h2 className="title text-black dark:text-white">Sign in</h2>
              {error === "signin-failed" && (
                <FormMessage>
                  {message || "Sign in failed. Please check your credentials."}
                </FormMessage>
              )}
              {error === "verification-required" && (
                <FormMessage>
                  {message || "Please verify your email before signing in."}
                </FormMessage>
              )}
              {error === "validation-failed" && (
                <FormMessage>
                  {message || "Please check your input and try again."}
                </FormMessage>
              )}
              <FormItem>
                <div className="input-field bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <MdOutlineMail className="icon text-gray-600 dark:text-gray-300" />
                  <input
                    name="identifier"
                    type="text"
                    placeholder="Email or Username"
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
            <form action={signUpActionHandler} className="sign-up-form">
              <h2 className="title text-black dark:text-white">Sign up</h2>
              {error === "signup-failed" && (
                <FormMessage>
                  {message || "Sign up failed. Please try again."}
                </FormMessage>
              )}
              {error === "email-exists" && (
                <FormMessage>
                  {message || "A user with this email already exists."}
                </FormMessage>
              )}
              {error === "username-exists" && (
                <FormMessage>
                  {message || "This username is already taken."}
                </FormMessage>
              )}
              {error === "validation-failed" && (
                <FormMessage>
                  {message || "Please check your input and try again."}
                </FormMessage>
              )}
              {success === "signup-complete" && (
                <FormMessage className="text-green-500">
                  {message || "Account created successfully!"}
                </FormMessage>
              )}
              {success === "verified" && (
                <FormMessage className="text-green-500">
                  {message ||
                    "Email verified successfully! You can now sign in."}
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
            </form>
            <SocialAuth />
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
            <Image
              priority
              src={log}
              className="image"
              alt="Logging"
              width={1140}
              height={787}
            />
          </div>
          <div className="panel right-panel">
            <div className="content">
              <h3>Already one of us ?</h3>
              <p>Just sign in and continue your journey with us</p>
              <ModeToggle mode="signin">Sign in</ModeToggle>
            </div>
            <Image
              priority
              src={reg}
              className="image"
              alt="Register"
              width={999}
              height={797}
            />{" "}
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}

// export default function AuthPage() {
//   return (
//     <Suspense fallback={<div>Loading...</div>}>
//       <AuthContent />
//     </Suspense>
//   );
// }
