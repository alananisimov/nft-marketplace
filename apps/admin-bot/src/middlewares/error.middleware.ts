import { mainMenuKeyboard } from "~/keyboard";
import type { BotContext } from "~/types";
import { BotError } from "~/utils/errors";

export async function errorHandler(error: unknown, ctx: BotContext) {
  console.error(`Error while handling update ${ctx.update.update_id}:`, error);

  const errorMessage =
    error instanceof BotError
      ? error.message
      : "An unexpected error occurred. Please try again later.";

  try {
    await ctx.reply(errorMessage, mainMenuKeyboard);
    await ctx.scene.leave();
  } catch (e) {
    console.error("Error while sending error message:", e);
  }
}
