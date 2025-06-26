import { z } from "zod";
import { loomerNameValidation } from "@/schemas/signUpSchema";
import { emailSchema } from "@/schemas/signInSchema";

// Email or username validation using consistent validation rules
const emailOrUsernameSchema = z.union([emailSchema, loomerNameValidation], {
  errorMap: () => ({ message: "Please enter a valid email or username" }),
});

// Email verification schema
export const verifyEmailSchema = z.object({
  identifier: emailOrUsernameSchema,
  verificationCode: z.string().length(6, "Verification code must be 6 digits"),
});

// Resend verification code schema
export const resendVerificationCodeSchema = z.object({
  identifier: emailOrUsernameSchema,
});

// Password reset initiation schema
export const initiatePasswordResetSchema = z.object({
  identifier: emailOrUsernameSchema,
});

// Password reset completion schema
export const resetPasswordSchema = z.object({
  identifier: emailOrUsernameSchema,
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  verificationCode: z.string().length(6, "Verification code must be 6 digits"),
});

// Send verification email schema
export const sendVerificationEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(1, "Username is required"),
  verificationCode: z.string().length(6, "Verification code must be 6 digits"),
  type: z
    .enum(["verification", "resend", "password-reset"])
    .default("verification"),
});

// Export types
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationCodeFormData = z.infer<
  typeof resendVerificationCodeSchema
>;
export type InitiatePasswordResetFormData = z.infer<
  typeof initiatePasswordResetSchema
>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type SendVerificationEmailFormData = z.infer<
  typeof sendVerificationEmailSchema
>;
