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

  // Validate input with safeParse
  const validation = signUpSchema.safeParse({ email, password, loomerName });

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.errors[0].message,
      data: {
        validationErrors: validation.error.errors,
      },
    };
  }

  try {
    const validatedData = validation.data;

    // Call the create user RPC function
    const result = await createUser({
      email: validatedData.email,
      password: validatedData.password,
      loomerName: validatedData.loomerName,
    });

    if (!result?.success) {
      const errorMessage = result?.error || "Unknown error";

      // Handle specific error types with better messaging
      if (errorMessage.toLowerCase().includes("email")) {
        return {
          success: false,
          message: "A user with this email already exists",
        };
      }

      if (
        errorMessage.toLowerCase().includes("username") ||
        errorMessage.toLowerCase().includes("loomer_name")
      ) {
        return {
          success: false,
          message: "This username is already taken",
        };
      }

      return {
        success: false,
        message: "Account creation failed. Please try again.",
      };
    }

    // Validate result data
    if (!result.user || !result.verification_code) {
      return {
        success: false,
        message: "Account creation incomplete. Please try again.",
      };
    }

    // Registration successful
    return {
      success: true,
      message: "Account created successfully! Please verify your email.",
      data: {
        verification_code: result.verification_code,
        user: result.user,
      },
    };
  } catch {
    return {
      success: false,
      message: "An unexpected error occurred during sign up",
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
  // Validate input with safeParse
  const validation = verifyEmailSchema.safeParse(formData);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.errors[0].message,
      data: { validationErrors: validation.error.errors },
    };
  }

  try {
    const validatedData = validation.data;
    const supabase = await createServerClient();

    // Call the verify_user_email RPC function
    const { data, error } = await supabase.rpc("verify_user_email", {
      p_email: validatedData.email,
      p_verification_code: validatedData.verificationCode,
    });

    if (error) {
      return {
        success: false,
        message: "Verification failed due to a technical error",
      };
    }

    if (!data?.success) {
      return {
        success: false,
        message: data?.error || "Invalid verification code",
      };
    }

    return {
      success: true,
      message: "Email verified successfully! You can now sign in.",
    };
  } catch {
    return {
      success: false,
      message: "An unexpected error occurred during verification",
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
  // Validate input with safeParse
  const validation = resendCodeSchema.safeParse(formData);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.errors[0].message,
      data: { validationErrors: validation.error.errors },
    };
  }

  try {
    const validatedData = validation.data;
    const supabase = await createServerClient();

    // Call the resend_verification_code RPC function
    const { data, error } = await supabase.rpc("resend_verification_code", {
      p_email: validatedData.email,
    });

    if (error) {
      return {
        success: false,
        message: "Failed to resend verification code due to technical error",
      };
    }

    if (!data?.success) {
      return {
        success: false,
        message: data?.error || "Failed to resend verification code",
      };
    }

    // Import and send email with resend type
    const { sendEmail } = await import("@/lib/sendEmail");

    // Get user info from the response or fetch it
    const { data: userData, error: userError } = await supabase
      .from("loomers")
      .select("loomer_name")
      .eq("email", validatedData.email)
      .single();

    if (userError) {
      return {
        success: false,
        message: "Failed to fetch user information",
      };
    }

    const emailResponse = await sendEmail(
      validatedData.email,
      userData.loomer_name,
      data.verification_code,
      "resend"
    );

    if (!emailResponse?.success) {
      return {
        success: false,
        message: "Verification code generated but failed to send email",
        data: { verification_code: data.verification_code },
      };
    }

    return {
      success: true,
      message: "New verification code sent to your email.",
      data: { verification_code: data.verification_code },
    };
  } catch {
    return {
      success: false,
      message: "An unexpected error occurred while resending verification code",
    };
  }
}
