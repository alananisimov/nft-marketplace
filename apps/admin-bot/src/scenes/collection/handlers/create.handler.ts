import "reflect-metadata";

import type { Message } from "telegraf/types";
import { Markup } from "telegraf";

import type { BotContext, CollectionSceneSession } from "~/types";
import { NAVIGATION_BUTTONS } from "~/constants";
import { container } from "~/core/container";
import { CollectionService } from "~/services";
import { mainMenuKeyboard } from "~/utils/keyboard";

const collectionService = container.resolve(CollectionService);

export const handleCreate = {
  async enter(ctx: BotContext) {
    await ctx.reply(
      "Please enter a name for the collection:",
      Markup.keyboard([[NAVIGATION_BUTTONS.CANCEL]]).resize(),
    );
  },

  async handleText(ctx: BotContext) {
    const message = ctx.message as Message.TextMessage;
    const text = message.text;
    const session = ctx.session.collection;

    if (!session.name) {
      session.name = text;
      await ctx.reply("Please enter a description for the collection:");
    } else if (!session.description) {
      session.description = text;
      await collectionService.confirmCollectionCreation(ctx);
    }
  },

  async confirm(ctx: BotContext) {
    const { name, description } = ctx.session
      .collection as CollectionSceneSession["collection"];
    await collectionService.createCollection(ctx, {
      name,
      description: description ?? "",
    });
    await ctx.answerCbQuery();
    await ctx.scene.leave();
  },

  async cancel(ctx: BotContext) {
    await ctx.reply("Operation cancelled.", mainMenuKeyboard);
    return ctx.scene.leave();
  },
};
