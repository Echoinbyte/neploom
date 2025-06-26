"use server";

import { z } from "zod";
import type { ApiResponse } from "@/types/api.types";
import { sendEmail } from "@/lib/sendEmail";

const sendVerificationEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(1, "Username is required"),
  verificationCode: z.string().length(6, "Verification code must be 6 digits"),
  type: z
    .enum(["verification", "resend", "password-reset"])
    .default("verification"),
});

export type SendVerificationEmailData = z.infer<
  typeof sendVerificationEmailSchema
>;

export async function sendVerificationEmailAction(
  formData: SendVerificationEmailData
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
