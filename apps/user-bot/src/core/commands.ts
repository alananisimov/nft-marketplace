import { env } from "env";
import type { Context, Telegraf } from "telegraf";
import { MESSAGES } from "~/constants";

export function initializeCommands(bot: Telegraf<Context>): void {
  bot.command("start", handleStart);
}

async function handleStart(ctx: Context): Promise<void> {
  await ctx.reply(MESSAGES.WELCOME, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "💻 Open app",
            web_app: {
              url: env.FRONTEND_URL,
            },
          },
        ],
      ],
    },
  });
}
