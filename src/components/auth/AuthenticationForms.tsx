"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { MdOutlineMail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { FormItem, FormMessage } from "@/components/ui/form";
import SimpleSubmitButton from "@/components/auth/SimpleSubmitButton";
import PasswordToggle from "@/components/auth/PasswordToggle";
import SocialAuth from "@/components/auth/SocialAuth";
import UsernameField from "@/components/auth/UsernameField";
import { signUpAction } from "@/actions/authentication/signUpActions";
import {
  sendVerificationEmailAction,
  resendVerificationCodeAction,
} from "@/actions/authentication/verificationActions";
import { signInSchema, signUpSchema } from "@/schemas";
import type { AuthData } from "@/types/api.types";
import { signIn } from "next-auth/react";

export default function AuthenticationForms() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSignInLoading, setIsSignInLoading] = useState(false);
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);
  const [signInErrors, setSignInErrors] = useState<Record<string, string>>({});
  const [signUpErrors, setSignUpErrors] = useState<Record<string, string>>({});

  const handleResendVerification = async (identifier: string) => {
    try {
      toast.loading("Resending verification email...", { id: "resend" });

      const response = await resendVerificationCodeAction({
        identifier,
      });

      if (response.success) {
        toast.success("Verification email sent! Check your inbox", {
          id: "resend",
        });
      } else {
        toast.error(response.message || "Failed to resend verification email", {
          id: "resend",
        });
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      toast.error("Failed to resend verification email", {
        id: "resend",
      });
    }
  };

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
      const response = await signIn("credentials", {
        redirect: false,
        identifier: formValues.identifier,
        password: formValues.password,
      });

      // Handle NextAuth response
      if (response?.ok) {
        toast.success("Welcome back!", { id: "signin" });
        router.push("/home");
      } else if (response?.error) {
        let errorMessage = "Sign in failed";
        let showVerificationInfo = false;

        switch (response.error) {
          case "CredentialsSignin":
            // Check the URL for our custom error codes using Next.js hook
            const errorParam = searchParams.get("error");

            if (errorParam === "VERIFICATION_REQUIRED") {
              errorMessage = "Please verify your email before signing in";
              showVerificationInfo = true;
            } else if (errorParam === "INVALID_CREDENTIALS") {
              errorMessage = "Invalid email/username or password";
            } else if (errorParam === "DATABASE_ERROR") {
              errorMessage =
                "Database connection failed. Please try again later.";
            } else {
              errorMessage = "Invalid email/username or password";
            }
            break;
          case "AccessDenied":
            errorMessage = "Access denied. Please check your credentials";
            break;
          default:
            errorMessage = "An error occurred during sign in";
        }

        toast.error(errorMessage, { id: "signin" });

        if (showVerificationInfo) {
          toast.info("Check your email for verification instructions", {
            duration: 6000,
          });

          // Show resend verification option
          setTimeout(() => {
            toast.custom(
              (toastId) => (
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    Didn&apos;t receive the verification email?
                  </p>
                  <button
                    onClick={() => {
                      handleResendVerification(formValues.identifier);
                      toast.dismiss(toastId);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Resend verification email
                  </button>
                </div>
              ),
              { duration: 10000 }
            );
          }, 2000);
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.", {
          id: "signin",
        });
      }
    } catch (error) {
      console.error("Sign in error:", error);

      // Handle different types of errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        toast.error(
          "Network error. Please check your connection and try again.",
          {
            id: "signin",
          }
        );
      } else if (error instanceof Error) {
        toast.error(
          error.message || "An unexpected error occurred. Please try again.",
          {
            id: "signin",
          }
        );
      } else {
        toast.error("An unexpected error occurred. Please try again.", {
          id: "signin",
        });
      }
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
              disabled={isSignInLoading}
              className={`${signInErrors.identifier ? "border-red-500" : ""} ${
                isSignInLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
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
