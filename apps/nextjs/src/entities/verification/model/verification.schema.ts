import { z } from "zod";

export const VerificationSchema = z.object({
  id: z.string(),
  walletAddress: z.string(),
  memo: z.string(),
  expiresAt: z.date(),
});
