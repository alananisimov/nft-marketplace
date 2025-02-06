import "reflect-metadata";

import type { BotContext } from "~/types";
import { container } from "~/core/container";
import { NFTService } from "~/services";
import { mainMenuKeyboard } from "~/utils/keyboard";

const nftService = container.resolve(NFTService);

export const handleList = {
  async enter(ctx: BotContext) {
    ctx.session.pagination.page = 1;
    await nftService.listNFTs(ctx);
  },

  async nextPage(ctx: BotContext) {
    ctx.session.pagination.page += 1;
    await nftService.listNFTs(ctx);
  },

  async prevPage(ctx: BotContext) {
    ctx.session.pagination.page = Math.max(1, ctx.session.pagination.page - 1);
    await nftService.listNFTs(ctx);
  },

  async mainMenu(ctx: BotContext) {
    await ctx.reply("Main Menu", mainMenuKeyboard);
    return ctx.scene.leave();
  },
};
