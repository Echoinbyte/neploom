"use server";

import { createServerClient } from "@/supabase/server";
import type { ApiResponse } from "@/types/api.types";
import {
  verifyEmailSchema,
  resendVerificationCodeSchema,
  initiatePasswordResetSchema,
  resetPasswordSchema,
  sendVerificationEmailSchema,
  type VerifyEmailFormData,
  type ResendVerificationCodeFormData,
  type InitiatePasswordResetFormData,
  type ResetPasswordFormData,
  type SendVerificationEmailFormData,
} from "@/schemas/verificationSchema";
import { sendEmail } from "@/lib/sendEmail";

// Re-export types for easier access
export type {
  VerifyEmailFormData,
  ResendVerificationCodeFormData,
  InitiatePasswordResetFormData,
  ResetPasswordFormData,
  SendVerificationEmailFormData,
};

/**
 * Verify user email with verification code
 */
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
      p_identifier: validatedData.identifier,
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

/**
 * Resend verification code to user
 */
export async function resendVerificationCodeAction(
  formData: ResendVerificationCodeFormData
): Promise<ApiResponse> {
  // Validate input with safeParse
  const validation = resendVerificationCodeSchema.safeParse(formData);

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
      p_identifier: validatedData.identifier,
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

    // Use the returned user data from the RPC function
    const emailResponse = await sendEmail(
      data.email,
      data.username,
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

/**
 * Initiate password reset by sending verification code
 */
export async function initiatePasswordResetAction(
  formData: InitiatePasswordResetFormData
): Promise<ApiResponse> {
  // Validate input with safeParse
  const validation = initiatePasswordResetSchema.safeParse(formData);

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

    // Call the initiate_password_reset RPC function
    const { data, error } = await supabase.rpc("initiate_password_reset", {
      p_identifier: validatedData.identifier,
    });

    if (error) {
      return {
        success: false,
        message: "Failed to initiate password reset due to technical error",
      };
    }

    if (!data?.success) {
      return {
        success: false,
        message: data?.error || "Failed to initiate password reset",
      };
    }

    // Use the returned user data from the RPC function
    const emailResponse = await sendEmail(
      data.email,
      data.username,
      data.verification_code,
      "password-reset"
    );

    if (!emailResponse?.success) {
      return {
        success: false,
        message: "Password reset code generated but failed to send email",
        data: { verification_code: data.verification_code },
      };
    }

    return {
      success: true,
      message: "Password reset code sent to your email.",
      data: { verification_code: data.verification_code },
    };
  } catch {
    return {
      success: false,
      message: "An unexpected error occurred while initiating password reset",
    };
  }
}

/**
 * Reset password using verification code
 */
export async function resetPasswordAction(
  formData: ResetPasswordFormData
): Promise<ApiResponse> {
  // Validate input with safeParse
  const validation = resetPasswordSchema.safeParse(formData);

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

    // Call the reset_password RPC function
    const { data, error } = await supabase.rpc("reset_password", {
      p_identifier: validatedData.identifier,
      p_new_password: validatedData.newPassword,
      p_verification_code: validatedData.verificationCode,
    });

    if (error) {
      return {
        success: false,
        message: "Failed to reset password due to technical error",
      };
    }

    if (!data?.success) {
      return {
        success: false,
        message: data?.error || "Failed to reset password",
      };
    }

    return {
      success: true,
      message:
        "Password reset successfully! You can now sign in with your new password.",
    };
  } catch {
    return {
      success: false,
      message: "An unexpected error occurred during password reset",
    };
  }
}

/**
 * Send verification email (server action for client components)
 */
export async function sendVerificationEmailAction(
  formData: SendVerificationEmailFormData
): Promise<ApiResponse> {
  // Validate input with safeParse
  const validation = sendVerificationEmailSchema.safeParse(formData);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.errors[0].message,
      data: { validationErrors: validation.error.errors },
    };
  }

  try {
    const validatedData = validation.data;

    const emailResponse = await sendEmail(
      validatedData.email,
      validatedData.username,
      validatedData.verificationCode,
      validatedData.type
    );

    if (!emailResponse.success) {
      return {
        success: false,
        message: emailResponse.message || "Failed to send verification email",
      };
    }

    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (error) {
    console.error("Email sending error:", error);
    return {
      success: false,
      message: "An unexpected error occurred while sending the email",
    };
  }
}
