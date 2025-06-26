"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MdOutlineMail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { FormItem, FormMessage } from "@/components/ui/form";
import SimpleSubmitButton from "@/components/auth/SimpleSubmitButton";
import PasswordToggle from "@/components/auth/PasswordToggle";
import SocialAuth from "@/components/auth/SocialAuth";
import UsernameField from "@/components/auth/UsernameField";
import { signInAction } from "@/actions/authentication/signInActions";
import { signUpAction } from "@/actions/authentication/signUpActions";
import { sendVerificationEmailAction } from "@/actions/authentication/emailActions";
import { signInSchema } from "@/schemas/signInSchema";
import { signUpSchema } from "@/schemas/signUpSchema";
import type { AuthData } from "@/types/api.types";

export default function AuthenticationForms() {
  const router = useRouter();
  const [isSignInLoading, setIsSignInLoading] = useState(false);
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);
  const [signInErrors, setSignInErrors] = useState<Record<string, string>>({});
  const [signUpErrors, setSignUpErrors] = useState<Record<string, string>>({});

  const handleSignIn = async (formData: FormData) => {
    setIsSignInLoading(true);
    setSignInErrors({});

    try {
      // Client-side validation with Zod
      const formValues = {
        identifier: formData.get("identifier") as string,
        password: formData.get("password") as string,
      };

      const validation = signInSchema.safeParse(formValues);

      if (!validation.success) {
        const errors: Record<string, string> = {};
        validation.error.errors.forEach((error) => {
          if (error.path[0]) {
            errors[error.path[0].toString()] = error.message;
          }
        });
        setSignInErrors(errors);
        toast.error("Please fix the validation errors");
        return;
      }

      toast.loading("Signing you in...", { id: "signin" });
      const response = await signInAction(formData);

      if (response.success) {
        toast.success("Welcome back!", { id: "signin" });
        router.push("/home");
      } else {
        toast.error(response.message || "Sign in failed", { id: "signin" });

        // Handle specific error cases
        if (response.message?.includes("verify")) {
          toast.info("Please check your email for verification instructions", {
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("An unexpected error occurred. Please try again.", {
        id: "signin",
      });
    } finally {
      setIsSignInLoading(false);
    }
  };

  const handleSignUp = async (formData: FormData) => {
    setIsSignUpLoading(true);
    setSignUpErrors({});

    try {
      // Client-side validation with Zod
      const formValues = {
        loomerName: formData.get("loomerName") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      };

      const validation = signUpSchema.safeParse(formValues);

      if (!validation.success) {
        const errors: Record<string, string> = {};
        validation.error.errors.forEach((error) => {
          if (error.path[0]) {
            errors[error.path[0].toString()] = error.message;
          }
        });
        setSignUpErrors(errors);
        toast.error("Please fix the validation errors");
        return;
      }

      toast.loading("Creating your account...", { id: "signup" });
      const response = await signUpAction(formData);

      if (response.success) {
        const responseData = response.data as AuthData;
        const { verification_code, user } = responseData;

        // Validate response data
        if (!user?.email || !user?.loomer_name || !verification_code) {
          toast.error("Account created but verification setup failed", {
            id: "signup",
          });
          return;
        }

        toast.success("Account created successfully!", { id: "signup" });

        // Send verification email
        toast.loading("Sending verification email...", { id: "email" });

        try {
          const emailResponse = await sendVerificationEmailAction({
            email: user.email,
            username: user.loomer_name,
            verificationCode: verification_code,
            type: "verification",
          });

          if (emailResponse?.success) {
            toast.success("Verification email sent! Check your inbox", {
              id: "email",
            });
          } else {
            toast.warning(
              emailResponse.message ||
                "Account created but email failed to send. You can request a new code later.",
              {
                id: "email",
                duration: 5000,
              }
            );
          }
        } catch (emailError) {
          console.error("Email sending error:", emailError);
          toast.warning("Account created but email failed to send", {
            id: "email",
          });
        }

        // Navigate to verification page
        router.push(`/authentication/verify-email/${user.loomer_name}`);
      } else {
        toast.error(response.message || "Sign up failed", { id: "signup" });

        // Handle specific errors with helpful messages
        if (response.message?.includes("email")) {
          toast.info("Try signing in instead if you already have an account", {
            duration: 4000,
          });
        } else if (response.message?.includes("username")) {
          toast.info("Please try a different username", {
            duration: 4000,
          });
        }
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("An unexpected error occurred. Please try again.", {
        id: "signup",
      });
    } finally {
      setIsSignUpLoading(false);
    }
  };

  return (
    <div className="signin-signup">
      {/* Sign In Form */}
      <form action={handleSignIn} className="sign-in-form">
        <h2 className="title text-black dark:text-white">Sign in</h2>

        <FormItem>
          <div className="input-field bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
            <MdOutlineMail className="icon text-gray-600 dark:text-gray-300" />
            <input
              name="identifier"
              type="text"
              placeholder="Email or Username"
              required
              autoComplete="username"
              className={signInErrors.identifier ? "border-red-500" : ""}
            />
          </div>
          {signInErrors.identifier && (
            <FormMessage className="text-red-500 text-sm mt-1">
              {signInErrors.identifier}
            </FormMessage>
          )}
        </FormItem>

        <FormItem>
          <PasswordToggle
            fieldName="password"
            placeholder="Password"
            icon={
              <RiLockPasswordLine className="icon text-gray-600 dark:text-gray-300" />
            }
          />
          {signInErrors.password && (
            <FormMessage className="text-red-500 text-sm mt-1">
              {signInErrors.password}
            </FormMessage>
          )}
        </FormItem>

        <SimpleSubmitButton>
          {isSignInLoading ? "Signing In..." : "Sign In"}
        </SimpleSubmitButton>

        <SocialAuth />
      </form>

      {/* Sign Up Form */}
      <form action={handleSignUp} className="sign-up-form">
        <h2 className="title text-black dark:text-white">Sign up</h2>

        <FormItem>
          <UsernameField />
          {signUpErrors.loomerName && (
            <FormMessage className="text-red-500 text-sm mt-1">
              {signUpErrors.loomerName}
            </FormMessage>
          )}
        </FormItem>

        <FormItem>
          <div className="input-field bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
            <MdOutlineMail className="icon text-gray-600 dark:text-gray-300" />
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              autoComplete="email"
              className={signUpErrors.email ? "border-red-500" : ""}
            />
          </div>
          {signUpErrors.email && (
            <FormMessage className="text-red-500 text-sm mt-1">
              {signUpErrors.email}
            </FormMessage>
          )}
        </FormItem>

        <FormItem>
          <PasswordToggle
            fieldName="password"
            placeholder="Password"
            icon={
              <RiLockPasswordLine className="icon text-gray-600 dark:text-gray-300" />
            }
          />
          {signUpErrors.password && (
            <FormMessage className="text-red-500 text-sm mt-1">
              {signUpErrors.password}
            </FormMessage>
          )}
        </FormItem>

        <SimpleSubmitButton>
          {isSignUpLoading ? "Creating Account..." : "Sign Up"}
        </SimpleSubmitButton>

        <SocialAuth />
      </form>
    </div>
  );
}
