import "reflect-metadata";

import type { PhotoSize } from "telegraf/types";
import { inject, injectable } from "tsyringe";

import {
  CreateNFTRewardInput,
  CreateRewardInput,
} from "@acme/api/modules/reward/application/dto";

import type { FileService } from "./file.service";
import type { BotContext, RewardSceneSession } from "~/types";
import { mainMenuKeyboard } from "~/keyboard";
import { BotError } from "~/utils/errors";
import { confirmationKeyboard } from "~/utils/keyboard";
import { api } from "~/utils/trpc";
import { BaseService } from "./base.service";

@injectable()
export class RewardService extends BaseService {
  constructor(
    @inject("FileService")
    private readonly fileService: FileService,
  ) {
    super();
  }

  async getAllRewards() {
    try {
      return await api.rewards.all.query();
    } catch (error) {
      console.error("Failed to fetch rewards:", error);
      throw new BotError(
        "Failed to fetch rewards. Please try again later.",
        "FETCH_ERROR",
      );
    }
  }

  async listRewards(ctx: BotContext) {
    try {
      const rewards = await this.getAllRewards();

      if (rewards.length === 0) {
        await this.returnToMainMenu(ctx, "No rewards found.");
        return;
      }

      await this.handlePagination(
        ctx,
        rewards,
        (reward) => `
<b>${reward.name}</b>
Symbol: ${reward.symbol}
Issuer: ${reward.issuer}
ID: <code>${reward.id}</code>
`,
        "🎁 Available Rewards:",
      );
    } catch (error) {
      console.error("Failed to list rewards:", error);
      throw new BotError(
        "Failed to list rewards. Please try again later.",
        "FETCH_ERROR",
      );
    }
  }

  async uploadImage(ctx: BotContext, photo: PhotoSize): Promise<string> {
    try {
      const file = await ctx.telegram.getFile(photo.file_id);
      if (!file.file_path) {
        throw new Error("File path not found");
      }

      const fileUrl = `https://api.telegram.org/file/bot${ctx.telegram.token}/${file.file_path}`;
      const response = await fetch(fileUrl);
      const buffer = Buffer.from(await response.arrayBuffer());

      const url = await this.fileService.uploadImage(buffer, {
        width: 400,
        height: 400,
        quality: 85,
      });

      return url;
    } catch (error) {
      console.error("Failed to upload image:", error);
      throw new BotError(
        "Failed to upload image. Please try again.",
        "UPLOAD_ERROR",
      );
    }
  }

  async createReward(ctx: BotContext, input: CreateRewardInput) {
    try {
      const reward = await api.rewards.create.mutate(input);

      await this.returnToMainMenu(
        ctx,
        `✅ Reward created successfully!\nReward ID: ${reward.id}`,
      );

      ctx.session.reward = {};
      return reward;
    } catch (error) {
      console.log("Failed to create reward:", error);
      throw new BotError(
        "Failed to create reward. Please try again later.",
        "CREATE_ERROR",
      );
    }
  }

  async confirmRewardCreation(ctx: BotContext) {
    const session = ctx.scene.session as RewardSceneSession;
    const rewardData = session.rewardData;

    const confirmationMessage = [
      "<b>Please confirm reward details:</b>",
      `Name: ${rewardData.name}`,
      `Symbol: ${rewardData.symbol}`,
      `Image: ${rewardData.image}`,
      `Issuer: ${rewardData.issuer}`,
    ].join("\n");

    await ctx.reply(confirmationMessage, {
      parse_mode: "HTML",
      ...confirmationKeyboard,
    });
  }

  async confirmRewardAttachment(ctx: BotContext) {
    const session = ctx.scene.session as RewardSceneSession;
    const rewardData = session.rewardData;

    const validatedReward = await CreateNFTRewardInput.parseAsync(rewardData);

    const [reward, nft] = await Promise.all([
      api.rewards.byId.query({ id: validatedReward.rewardId }),
      api.nft.byId.query({ id: validatedReward.nftId }),
    ]);

    const confirmationMessage = [
      "<b>Please confirm reward attachment:</b>",
      `Reward: ${reward.name} (${reward.symbol})`,
      `NFT: ${nft.name} (${nft.assetCode})`,
      `Monthly Percentage: ${validatedReward.monthlyPercentage}%`,
    ].join("\n");

    await ctx.reply(confirmationMessage, {
      parse_mode: "HTML",
      ...confirmationKeyboard,
    });
  }

  async attachRewardToNFT(
    ctx: BotContext,
    data: RewardSceneSession["rewardData"],
  ) {
    const validatedData = await CreateNFTRewardInput.parseAsync(data);

    await api.rewards.attachToNFT.mutate(validatedData);

    await ctx.reply(
      "✅ Reward successfully attached to NFT!",
      mainMenuKeyboard,
    );
  }
}
