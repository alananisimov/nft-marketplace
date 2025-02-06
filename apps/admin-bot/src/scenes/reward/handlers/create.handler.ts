import type { Message } from "telegraf/types";
import { Markup } from "telegraf";

import {
  CreateNFTRewardInput,
  CreateRewardInput,
} from "@acme/api/modules/reward/application/dto";

import type { BotContext, RewardSceneSession } from "~/types";
import { MESSAGES, NAVIGATION_BUTTONS } from "~/constants";
import { container } from "~/core/container";
import { NFTService, RewardService } from "~/services";
import { ValidationError } from "~/utils/errors";
import { mainMenuKeyboard } from "~/utils/keyboard";
import { isValidAddress, isValidNumber } from "~/utils/validators";

const rewardService = container.resolve(RewardService);
const nftService = container.resolve(NFTService);

const REWARD_ACTIONS = {
  CREATE_NEW: "create_new",
  ATTACH_EXISTING: "attach_existing",
} as const;

export const handleCreate = {
  async enter(ctx: BotContext) {
    await ctx.reply(
      "🎁 What would you like to do?",
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            "Create New Reward",
            REWARD_ACTIONS.CREATE_NEW,
          ),
          Markup.button.callback(
            "Attach Existing Reward",
            REWARD_ACTIONS.ATTACH_EXISTING,
          ),
        ],
      ]),
    );
  },

  async handleCreateNew(ctx: BotContext) {
    const session = ctx.scene.session as RewardSceneSession;
    session.action = "create";
    session.rewardData = {};

    await ctx.reply(
      "Please enter the name for the new reward:",
      Markup.keyboard([[NAVIGATION_BUTTONS.CANCEL]]).resize(),
    );
    await ctx.answerCbQuery();
  },

  async handleAttachExisting(ctx: BotContext) {
    const rewards = await rewardService.getAllRewards();
    const session = ctx.scene.session as RewardSceneSession;

    if (!rewards.length) {
      await ctx.reply(
        "No rewards found. Please create a new reward first.",
        mainMenuKeyboard,
      );
      return ctx.scene.leave();
    }

    session.action = "attach";
    session.rewardData = {};

    const keyboard = rewards.map((reward) => [
      Markup.button.callback(
        `${reward.name} (${reward.symbol})`,
        `select_reward:${reward.id}`,
      ),
    ]);

    await ctx.reply(
      "Select a reward to attach:",
      Markup.inlineKeyboard([
        ...keyboard,
        [Markup.button.callback(NAVIGATION_BUTTONS.CANCEL, "cancel")],
      ]),
    );
    await ctx.answerCbQuery();
  },

  async handleRewardSelect(ctx: BotContext & { match: string[] }) {
    const rewardId = ctx.match[1];
    const session = ctx.scene.session as RewardSceneSession;
    session.rewardData = { rewardId };

    const nfts = await nftService.getNFTs();

    if (nfts.length === 0) {
      await ctx.reply(
        "No NFTs found. Please create an NFT first.",
        mainMenuKeyboard,
      );
      return ctx.scene.leave();
    }

    const nftButtons = nfts.map((nft) => [
      Markup.button.callback(
        `${nft.name} (${nft.assetCode})`,
        `select_nft:${nft.id}`,
      ),
    ]);

    await ctx.reply(
      "Select an NFT to attach the reward to:",
      Markup.inlineKeyboard([
        ...nftButtons,
        [Markup.button.callback(NAVIGATION_BUTTONS.CANCEL, "cancel")],
      ]),
    );
    await ctx.answerCbQuery();
  },

  async handleNFTSelect(ctx: BotContext & { match: string[] }) {
    const nftId = ctx.match[1];
    const session = ctx.scene.session as RewardSceneSession;

    session.rewardData.nftId = nftId;

    await ctx.reply(
      "Please enter the monthly reward percentage (0-100):",
      Markup.keyboard([[NAVIGATION_BUTTONS.CANCEL]]).resize(),
    );
    await ctx.answerCbQuery();
  },

  async handleText(ctx: BotContext) {
    const message = ctx.message as Message.TextMessage;
    const text = message.text;
    const session = ctx.scene.session as RewardSceneSession;

    if (session.action === "create") {
      await this.handleCreateText(ctx, text, session);
    } else if (session.action == "attach") {
      await this.handleAttachText(ctx, text, session);
    }
  },

  async handleCreateText(
    ctx: BotContext,
    text: string,
    session: RewardSceneSession,
  ) {
    if (!session.rewardData.name) {
      session.rewardData.name = text;
      await ctx.reply(
        "Please enter the symbol for the reward (e.g., BTC, ETH):",
      );
    } else if (!session.rewardData.symbol) {
      session.rewardData.symbol = text.toUpperCase();
      await ctx.reply(
        "Please send an image for the reward:",
        Markup.keyboard([[NAVIGATION_BUTTONS.CANCEL]]).resize(),
      );
    } else if (session.rewardData.image && !session.rewardData.issuer) {
      if (!isValidAddress(text)) {
        throw new ValidationError("Please enter a valid issuer address.");
      }
      session.rewardData.issuer = text;
      await rewardService.confirmRewardCreation(ctx);
    }
  },

  async handleAttachText(
    ctx: BotContext,
    text: string,
    session: RewardSceneSession,
  ) {
    if (!session.rewardData.nftId) {
      throw new ValidationError("NFT not selected");
    }

    if (!session.rewardData.monthlyPercentage) {
      if (!isValidNumber(text)) {
        throw new ValidationError(MESSAGES.INVALID_NUMBER);
      }

      const percentage = parseFloat(text);
      if (percentage < 0 || percentage > 100) {
        throw new ValidationError("Percentage must be between 0 and 100");
      }

      session.rewardData.monthlyPercentage = percentage;
      await rewardService.confirmRewardAttachment(ctx);
    }
  },

  async handlePhoto(ctx: BotContext) {
    const message = ctx.message as Message.PhotoMessage;
    const session = ctx.scene.session as RewardSceneSession;

    if (session.action !== "create") {
      throw new ValidationError(
        "Photos can only be uploaded when creating a new reward.",
      );
    }

    const photo = message.photo[message.photo.length - 1];
    if (!photo) {
      throw new ValidationError(MESSAGES.UPLOAD_FAILED);
    }

    try {
      const imageUrl = await rewardService.uploadImage(ctx, photo);
      session.rewardData.image = imageUrl;
      await ctx.reply(
        "Image uploaded successfully!\n\nPlease enter the issuer address:",
        Markup.keyboard([[NAVIGATION_BUTTONS.CANCEL]]).resize(),
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new ValidationError(MESSAGES.UPLOAD_FAILED);
    }
  },

  async confirm(ctx: BotContext) {
    const session = ctx.scene.session as RewardSceneSession;

    if (session.action === "create") {
      const validatedData = await CreateRewardInput.parseAsync(
        session.rewardData,
      );
      await rewardService.createReward(ctx, validatedData);
      session.action = undefined;
    } else if (session.action == "attach") {
      const validatedData = await CreateNFTRewardInput.parseAsync(
        session.rewardData,
      );
      await rewardService.attachRewardToNFT(ctx, validatedData);
      session.action = undefined;
    }
    await ctx.answerCbQuery();
    return ctx.scene.leave();
  },

  async cancel(ctx: BotContext) {
    await ctx.reply(MESSAGES.OPERATION_CANCELLED, mainMenuKeyboard);
    return ctx.scene.leave();
  },
};
