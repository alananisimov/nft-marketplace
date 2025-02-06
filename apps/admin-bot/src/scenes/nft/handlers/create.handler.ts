import "reflect-metadata";

import type { Message } from "telegraf/types";
import { Markup } from "telegraf";

import { CreateNFTInput } from "@acme/api/modules/nft/application/dto";

import type { BotContext, NFTSceneSession } from "~/types";
import { MESSAGES, NAVIGATION_BUTTONS } from "~/constants";
import { container } from "~/core/container";
import { CollectionService, NFTService } from "~/services";
import { ValidationError } from "~/utils/errors";
import { mainMenuKeyboard } from "~/utils/keyboard";
import { isValidNumber } from "~/utils/validators";

const nftService = container.resolve(NFTService);
const collectionService = container.resolve(CollectionService);

export const handleCreate = {
  async enter(ctx: BotContext) {
    const collections = await collectionService.getAllCollections();

    if (collections.length === 0) {
      await ctx.reply(
        "No collections found. Please create a collection first.",
        mainMenuKeyboard,
      );
      return ctx.scene.leave();
    }

    const collectionButtons = collections.map((collection) => [
      Markup.button.callback(
        collection.name,
        `select_collection:${collection.id}`,
      ),
    ]);

    await ctx.reply(
      "Please select a collection for the new NFT:",
      Markup.inlineKeyboard([
        ...collectionButtons,
        [Markup.button.callback("❌ Cancel", "cancel")],
      ]),
    );
  },

  async handleCollectionSelect(ctx: BotContext & { match: string[] }) {
    const collectionId = ctx.match[1];
    const session = ctx.scene.session as NFTSceneSession;

    session.nftData = { collectionId };
    await ctx.reply(
      "Please enter the asset code for the NFT:",
      Markup.keyboard([[NAVIGATION_BUTTONS.CANCEL]]).resize(),
    );
    await ctx.answerCbQuery();
  },

  async handleText(ctx: BotContext) {
    const message = ctx.message as Message.TextMessage;
    const text = message.text;
    const session = ctx.scene.session as NFTSceneSession;

    if (!session.nftData.assetCode) {
      session.nftData = { ...session.nftData, assetCode: text };
      await ctx.reply("Please enter a name for the NFT:");
    } else if (!session.nftData.name) {
      session.nftData.name = text;
      await ctx.reply("Please enter a description for the NFT:");
    } else if (!session.nftData.description) {
      session.nftData.description = text;
      await ctx.reply(
        "Please send an image for the NFT:",
        Markup.keyboard([[NAVIGATION_BUTTONS.CANCEL]]).resize(),
      );
    } else if (!session.nftData.lockupPeriod && session.nftData.image) {
      if (!isValidNumber(text)) {
        throw new ValidationError(MESSAGES.INVALID_NUMBER);
      }
      session.nftData.lockupPeriod = parseInt(text);
      await ctx.reply("Please enter the domain for the NFT:");
    } else if (!session.nftData.domain) {
      session.nftData.domain = text;
      await ctx.reply("Please enter the code for the NFT:");
    } else if (!session.nftData.code) {
      session.nftData.code = text;
      await nftService.confirmNFTCreation(ctx);
    }
  },

  async handlePhoto(ctx: BotContext) {
    const session = ctx.scene.session as NFTSceneSession;
    const message = ctx.message as Message.PhotoMessage;
    const photo = message.photo[message.photo.length - 1];

    if (!photo) {
      throw new ValidationError(MESSAGES.UPLOAD_FAILED);
    }

    await ctx.reply(MESSAGES.UPLOADING_IMAGE);

    try {
      const imageUrl = await nftService.uploadImage(ctx, photo);
      session.nftData = { ...session.nftData, image: imageUrl };

      await ctx.reply(
        "Image uploaded successfully! Please enter the lockup period in days:",
        Markup.keyboard([[NAVIGATION_BUTTONS.CANCEL]]).resize(),
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new ValidationError(MESSAGES.UPLOAD_FAILED);
    }
  },

  async confirm(ctx: BotContext) {
    await ctx.reply(MESSAGES.CREATING_NFT);

    try {
      const session = ctx.scene.session as NFTSceneSession;
      const validatedNft = await CreateNFTInput.parseAsync(session.nftData);
      await nftService.createNFT(ctx, validatedNft);
      await ctx.reply(MESSAGES.NFT_CREATED_SUCCESSFULLY);
      await ctx.answerCbQuery();
      return ctx.scene.leave();
    } catch {
      await ctx.reply(MESSAGES.ERROR_OCCURRED);
      await ctx.answerCbQuery();
      return ctx.scene.leave();
    }
  },

  async cancel(ctx: BotContext) {
    await ctx.reply(MESSAGES.OPERATION_CANCELLED, mainMenuKeyboard);
    return ctx.scene.leave();
  },
};
