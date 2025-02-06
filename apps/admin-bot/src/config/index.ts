import { env } from "env";

export const config = {
  bot: {
    token: env.TELEGRAM_BOT_TOKEN,
  },
  pagination: {
    defaultPage: 1,
    itemsPerPage: 10,
  },
  session: {
    ttl: 3600,
  },
  image: {
    defaultQuality: 80,
    maxWidth: 600,
    maxHeight: 800,
  },
} as const;
