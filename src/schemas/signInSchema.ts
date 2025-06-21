import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const emailSchema = z.string().email({
  message: "Invalid email address",
});
export const signInSchema = z.object({
  identifier: z.union([usernameValidation, emailSchema]),
  password: z
    .string()
    .min(8, { message: "Password must be 8 characters or more" })
    .max(50, { message: "Password must be 50 characters or less" }),
});
