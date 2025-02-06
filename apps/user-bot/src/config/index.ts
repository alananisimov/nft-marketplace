import { env } from "env";

export const config = {
  bot: {
    token: env.USER_BOT_TELEGRAM_BOT_TOKEN,
  },
} as const;
