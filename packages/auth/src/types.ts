import { z } from "zod";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  userId: string;
  telegramId: number;
  publicKey: string;
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
  expiresAt: number;
}

export const LoginInputSchema = z.object({
  telegramId: z.number(),
  publicKey: z.string().min(1),
  password: z.string().min(6),
});

export type LoginInput = z.infer<typeof LoginInputSchema>;

export const RegisterInputSchema = z.object({
  telegramId: z.number(),
  password: z.string().min(6),
  publicKey: z.string().length(56),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const TokenResponseSchema = z.object({
  userId: z.string(),
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

export type TokenResponse = z.infer<typeof TokenResponseSchema>;
