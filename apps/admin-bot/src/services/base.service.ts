import type { BotContext } from "~/types";
import { NAVIGATION_BUTTONS } from "~/constants";
import { mainMenuKeyboard } from "~/keyboard";

export abstract class BaseService {
  protected createPaginationKeyboard(
    hasNextPage: boolean,
    hasPrevPage: boolean,
  ) {
    const buttons = [];
    if (hasPrevPage) buttons.push(NAVIGATION_BUTTONS.PREV_PAGE);
    if (hasNextPage) buttons.push(NAVIGATION_BUTTONS.NEXT_PAGE);
    buttons.push(NAVIGATION_BUTTONS.MAIN_MENU);

    return {
      reply_markup: {
        keyboard: [buttons],
        resize_keyboard: true,
      },
    };
  }

  protected async handlePagination<T>(
    ctx: BotContext,
    items: T[],
    renderItem: (item: T) => string,
    headerText: string,
  ) {
    const { page, itemsPerPage } = ctx.session.pagination;
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const paginatedItems = items.slice(startIdx, endIdx);

    const messageText = [
      headerText,
      "",
      ...paginatedItems.map(renderItem),
      "",
      `Page ${page} of ${Math.ceil(items.length / itemsPerPage)}`,
    ].join("\n");

    await ctx.reply(messageText, {
      parse_mode: "HTML",
      ...this.createPaginationKeyboard(endIdx < items.length, page > 1),
    });
  }

  protected async returnToMainMenu(ctx: BotContext, message: string) {
    await ctx.reply(message, mainMenuKeyboard);
  }

  protected clearSessionData(ctx: BotContext) {
    ctx.session = {
      collection: {},
      nft: {},
      reward: {},
      pagination: { page: 1, itemsPerPage: 10 },
    };
  }
}
