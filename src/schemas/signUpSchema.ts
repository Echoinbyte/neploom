import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(2, "Username must be at least 2 characters")
  .max(20, "Username must be no more than 20 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username must only contain letters, digits, and underscores",
  );

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must not be less than 8 characters" })
    .max(50, { message: "Password must not be more than 50 characters" }),
});
