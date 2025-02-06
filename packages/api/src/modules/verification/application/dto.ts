import { z } from "zod";

export const CreateVerificationInput = z.object({
  publicKey: z.string(),
});

export type CreateVerificationInput = z.infer<typeof CreateVerificationInput>;

export const CreateVerificationResponse = z.object({
  id: z.string(),
  walletAddress: z.string(),
  memo: z.string(),
  expiresAt: z.date(),
});

export type CreateVerificationResponse = z.infer<
  typeof CreateVerificationResponse
>;

export const ResetPasswordInput = z.object({
  publicKey: z.string(),
  verificationId: z.string(),
  newPassword: z.string().min(6),
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordInput>;

export const ResetPasswordOutput = z.object({
  success: z.boolean(),
});

export type ResetPasswordOutput = z.infer<typeof ResetPasswordOutput>;

export const CheckVerificationStatusInput = z.object({
  verificationId: z.string(),
});

export type CheckVerificationStatusInput = z.infer<
  typeof CheckVerificationStatusInput
>;

export const CheckVerificationStatusOutput = z.object({
  isVerified: z.boolean(),
});

export type CheckVerificationStatusOutput = z.infer<
  typeof CheckVerificationStatusOutput
>;
