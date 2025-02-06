import { z } from "zod";

export const RegisterInput = z.object({
  telegramId: z.number(),
  telegramHash: z.string().min(1),
  password: z.string().min(6),
  publicKey: z.string().length(56),
});

export type RegisterInput = z.infer<typeof RegisterInput>;

export const LoginInput = z.object({
  telegramId: z.number(),
  publicKey: z.string().min(1),
  password: z.string().min(6),
});

export type LoginInput = z.infer<typeof LoginInput>;

export const TokenResponse = z.object({
  userId: z.string(),
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

export type TokenResponse = z.infer<typeof TokenResponse>;

const ChatSchema = z.object({
  id: z.number(),
  type: z.string(),
  title: z.string().optional(),
  username: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional()
});

const UserSchema = z.object({
  id: z.number(),
  is_bot: z.boolean(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  language_code: z.string().optional()
});

const InitDataSchema = z.object({
  authDate: z.preprocess(arg => new Date(Number(arg) * 1000), z.date()),
  canSendAfter: z.number().optional(),
  canSendAfterDate: z.preprocess(arg => (arg ? new Date(Number(arg) * 1000) : undefined), z.date().optional()),
  chat: ChatSchema.optional(),
  chatType: z.string().optional(),
  chatInstance: z.string().optional(),
  hash: z.string(),
  queryId: z.string().optional(),
  receiver: UserSchema.optional(),
  startParam: z.string().optional(),
  user: UserSchema.optional()
});

export const TelegramAutoLogin = InitDataSchema

export type TelegramAutoLogin = z.infer<typeof TelegramAutoLogin>
