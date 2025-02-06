import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  server: {
    TELEGRAM_BOT_TOKEN: z.string().min(1),
    API_PORT: z.coerce.number(),
    REDIS_URL: z.string().min(1),
    MINIO_URL: z.string().min(1),
    MINIO_HOST: z.string().min(1),
    MINIO_ROOT_USER: z.string().min(1),
    MINIO_ROOT_PASSWORD: z.string().min(1),
    MINIO_PORT: z.coerce.number(),
    NEXTAUTH_URL: z.string().min(1),
    ADMIN_PRIVATE_KEY: z.string().min(1),
    STELLAR_HORIZON_URL: z.string().min(1),
    STELLAR_NETWORK: z.string().min(1),
    STELLAR_MAIN_WALLET: z.string().min(1),
    TEST_ISSUER_SK: z.string().default(""),
    TEST_DISTRIB_SK: z.string().default(""),
    JWT_REFRESH_SECRET: z.string().min(1),
    JWT_ACCESS_SECRET: z.string().min(1),
  },
  client: {},
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
  },
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
