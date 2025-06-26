"use server";

import { z } from "zod";
import { signIn } from "next-auth/react";
import { createServerClient } from "@/supabase/server";
import { signInSchema } from "@/schemas/signInSchema";
import type { ApiResponse } from "@/types/api.types";

export type SignInFormData = z.infer<typeof signInSchema>;

export async function signInAction(formData: FormData): Promise<ApiResponse> {
  // Extract data from FormData
  const identifier = formData.get("identifier") as string;
  const password = formData.get("password") as string;

  // Validate input with safeParse
  const validation = signInSchema.safeParse({ identifier, password });

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
    const supabase = await createServerClient();

    // Call the authenticate_user RPC function
    const { data, error } = await supabase.rpc("authenticate_user", {
      p_identifier: validatedData.identifier,
      p_password: validatedData.password,
    });

    if (error) {
      return {
        success: false,
        message: "Authentication failed due to a technical error",
      };
    }

    if (!data?.success) {
      if (data?.requires_verification) {
        return {
          success: false,
          message: "Please verify your email before signing in",
          data: {
            requires_verification: true,
          },
        };
      }
      return {
        success: false,
        message: data?.error || "Invalid credentials",
      };
    }

    // If authentication is successful
    return {
      success: true,
      message: "Sign in successful",
      data: {
        user: data.user,
      },
    };
  } catch {
    return {
      success: false,
      message: "An unexpected error occurred during sign in",
    };
  }
}

// Server action for NextAuth credential sign in
export async function credentialSignInAction(
  formData: SignInFormData
): Promise<ApiResponse> {
  try {
    const validatedData = signInSchema.parse(formData);

    const result = await signIn("credentials", {
      identifier: validatedData.identifier,
      password: validatedData.password,
      redirect: false,
    });

    if (result?.error) {
      return {
        success: false,
        message: result.error,
      };
    }

    // Return success - client will handle navigation
    return {
      success: true,
      message: "Sign in successful",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.errors[0].message,
        data: {
          validationErrors: error.errors,
        },
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to sign in",
    };
  }
}

// Social sign in actions
export async function googleSignInAction() {
  try {
    await signIn("google", { callbackUrl: "/home" });
  } catch (error) {
    throw error;
  }
}

export async function githubSignInAction() {
  try {
    await signIn("github", { callbackUrl: "/home" });
  } catch (error) {
    throw error;
  }
}

export async function facebookSignInAction() {
  try {
    await signIn("facebook", { callbackUrl: "/home" });
  } catch (error) {
    throw error;
  }
}

export async function twitterSignInAction() {
  try {
    await signIn("twitter", { callbackUrl: "/home" });
  } catch (error) {
    throw error;
  }
}

export async function linkedinSignInAction() {
  try {
    await signIn("linkedin", { callbackUrl: "/home" });
  } catch (error) {
    throw error;
  }
}
