import { z } from "zod";

export const LoginSchema = z.object({
  stellar_key: z.string().min(1, "Stellar Key is required"),
  password: z.string().min(1, "Password is required!"),
});
