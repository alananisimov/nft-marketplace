import type { BotContext } from "~/types";
import { container } from "~/core/container";
import { RewardService } from "~/services";
import { mainMenuKeyboard } from "~/utils/keyboard";

const rewardService = container.resolve(RewardService);

export const handleList = {
  async enter(ctx: BotContext) {
    ctx.session.pagination.page = 1;
    await rewardService.listRewards(ctx);
  },

  async nextPage(ctx: BotContext) {
    ctx.session.pagination.page += 1;
    await rewardService.listRewards(ctx);
  },

  async prevPage(ctx: BotContext) {
    ctx.session.pagination.page = Math.max(1, ctx.session.pagination.page - 1);
    await rewardService.listRewards(ctx);
  },

  async mainMenu(ctx: BotContext) {
    await ctx.reply("Main Menu", mainMenuKeyboard);
    return ctx.scene.leave();
  },
};
