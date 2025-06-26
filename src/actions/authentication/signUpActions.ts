"use server";

import { createUser } from "@/supabase/rpc/auth";
import { signUpSchema, type SignUpFormData } from "@/schemas/signUpSchema";
import type { ApiResponse } from "@/types/api.types";

export type { SignUpFormData };

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
