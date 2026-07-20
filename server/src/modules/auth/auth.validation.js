import { email, z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters").max(50),

  email: z
    .string()
    .email("Invalid email")
    .transform((email) => email.toLowerCase().trim()),

  password: z.string().min(8, "Password must be at least 8 characters").max(20),
});

export const loginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),

  password: z.string().min(8).max(20),
});
