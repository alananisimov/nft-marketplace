import "reflect-metadata";

import type { BotContext } from "~/types";
import { container } from "~/core/container";
import { CollectionService } from "~/services";
import { mainMenuKeyboard } from "~/utils/keyboard";

const collectionService = container.resolve(CollectionService);

export const handleList = {
  async enter(ctx: BotContext) {
    ctx.session.pagination.page = 1;
    await collectionService.listCollections(ctx);
  },

  async nextPage(ctx: BotContext) {
    ctx.session.pagination.page += 1;
    await collectionService.listCollections(ctx);
  },

  async prevPage(ctx: BotContext) {
    ctx.session.pagination.page = Math.max(1, ctx.session.pagination.page - 1);
    await collectionService.listCollections(ctx);
  },

  async mainMenu(ctx: BotContext) {
    await ctx.reply("Main Menu", mainMenuKeyboard);
    return ctx.scene.leave();
  },
};
