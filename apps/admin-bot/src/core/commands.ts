import type { Telegraf } from "telegraf";
import { Markup } from "telegraf";

import { MAIN_MENU_BUTTONS, MESSAGES } from "~/constants";
import type { BotContext } from "~/types";

export function initializeCommands(bot: Telegraf<BotContext>): void {
  bot.command("start", handleStart);

  bot.hears(MAIN_MENU_BUTTONS.CREATE_COLLECTION, (ctx) =>
    ctx.scene.enter("create_collection"),
  );

  bot.hears(MAIN_MENU_BUTTONS.LIST_COLLECTIONS, (ctx) =>
    ctx.scene.enter("list_collections"),
  );

  bot.hears(MAIN_MENU_BUTTONS.CREATE_NFT, (ctx) =>
    ctx.scene.enter("create_nft"),
  );

  bot.hears(MAIN_MENU_BUTTONS.LIST_NFTS, (ctx) => ctx.scene.enter("list_nfts"));

  bot.hears(MAIN_MENU_BUTTONS.CREATE_REWARD, (ctx) =>
    ctx.scene.enter("create_reward"),
  );

  bot.hears(MAIN_MENU_BUTTONS.LIST_REWARDS, (ctx) =>
    ctx.scene.enter("list_rewards"),
  );
}

async function handleStart(ctx: BotContext): Promise<void> {
  await ctx.reply(
    MESSAGES.WELCOME,
    Markup.keyboard([
      [MAIN_MENU_BUTTONS.CREATE_COLLECTION, MAIN_MENU_BUTTONS.LIST_COLLECTIONS],
      [MAIN_MENU_BUTTONS.CREATE_REWARD, MAIN_MENU_BUTTONS.LIST_REWARDS],
      [MAIN_MENU_BUTTONS.CREATE_NFT, MAIN_MENU_BUTTONS.LIST_NFTS],
    ]).resize(),
  );
}
