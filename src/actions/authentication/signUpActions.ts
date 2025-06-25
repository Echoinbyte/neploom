"use server";

import { z } from "zod";
import { createUser } from "@/supabase/rpc/auth";
import { createServerClient } from "@/supabase/server";
import { signUpSchema } from "@/schemas/signUpSchema";
import type { ApiResponse } from "@/types/api.types";

export type SignUpFormData = z.infer<typeof signUpSchema>;

export async function signUpAction(formData: FormData): Promise<ApiResponse> {
  // Extract data from FormData
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const loomerName = formData.get("loomerName") as string;

  // Validate input
  try {
    const validatedData = signUpSchema.parse({ email, password, loomerName });

    // Call the create user RPC function
    const result = await createUser({
      email: validatedData.email,
      password: validatedData.password,
      loomerName: validatedData.loomerName,
    });

    if (!result || !result.success) {
      const errorMessage = result?.error || "Unknown error";

      if (errorMessage.includes("email")) {
        return {
          success: false,
          message: "A user with this email already exists",
          data: {
            redirectTo: "/authentication?error=email-exists&mode=signup",
          },
        };
      }

      if (errorMessage.includes("username")) {
        return {
          success: false,
          message: "This username is already taken",
          data: {
            redirectTo: "/authentication?error=username-exists&mode=signup",
          },
        };
      }

      return {
        success: false,
        message: "Sign up failed. Please try again.",
        data: { redirectTo: "/authentication?error=signup-failed&mode=signup" },
      };
    }

    // Registration successful
    return {
      success: true,
      message: "Account created successfully! Please verify your email.",
      data: {
        redirectTo: "/verifyEmail",
        verification_code: result.verification_code,
        user: result.user,
      },
    };
  } catch (error) {
    console.error("Sign up validation error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0].message,
        data: {
          redirectTo: "/authentication?error=validation-failed&mode=signup",
          validationErrors: error.errors,
        },
      };
    }

    return {
      success: false,
      message: "Sign up failed. Please try again.",
      data: { redirectTo: "/authentication?error=signup-failed&mode=signup" },
    };
  }
}

const verifyEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  verificationCode: z.string().length(6, "Verification code must be 6 digits"),
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

export async function verifyEmailAction(
  formData: VerifyEmailFormData
): Promise<ApiResponse> {
  try {
    // Validate input
    const validatedData = verifyEmailSchema.parse(formData);

    const supabase = await createServerClient();

    // Call the verify_user_email RPC function
    const { data, error } = await supabase.rpc("verify_user_email", {
      p_email: validatedData.email,
      p_verification_code: validatedData.verificationCode,
    });

    if (error) {
      console.error("Email verification error:", error);
      return {
        success: false,
        message: "Verification failed",
      };
    }

    if (!data.success) {
      return {
        success: false,
        message: data.error,
      };
    }

    return {
      success: true,
      message: "Email verified successfully! You can now sign in.",
      data: { redirectTo: "/authentication?success=verified" },
    };
  } catch (error) {
    console.error("Email verification error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0].message,
        data: { validationErrors: error.errors },
      };
    }

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to verify email",
    };
  }
}

const resendCodeSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ResendCodeFormData = z.infer<typeof resendCodeSchema>;

export async function resendVerificationCodeAction(
  formData: ResendCodeFormData
): Promise<ApiResponse> {
  try {
    // Validate input
    const validatedData = resendCodeSchema.parse(formData);

    const supabase = await createServerClient();

    // Call the resend_verification_code RPC function
    const { data, error } = await supabase.rpc("resend_verification_code", {
      p_email: validatedData.email,
    });

    if (error) {
      console.error("Resend verification error:", error);
      return {
        success: false,
        message: "Failed to resend verification code",
      };
    }

    if (!data.success) {
      return {
        success: false,
        message: data.error,
      };
    }

    // TODO: Send new verification email using data.verification_code

    return {
      success: true,
      message: "New verification code sent to your email.",
      data: { verification_code: data.verification_code },
    };
  } catch (error) {
    console.error("Resend verification code error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0].message,
        data: { validationErrors: error.errors },
      };
    }

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to resend verification code",
    };
  }
}
