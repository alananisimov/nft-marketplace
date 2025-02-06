import { z } from "zod";

export const RegisterSchema = z.object({
  publicKey: z.string().min(1, "Stellar Public Key is required"),
  password: z.string().min(1, "Password is required!"),
});
