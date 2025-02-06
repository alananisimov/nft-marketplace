import { z } from "zod";

export const stellarKeySchema = z.object({
  stellarKey: z.string().min(1, "Stellar key is required"),
});

export const passwordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
