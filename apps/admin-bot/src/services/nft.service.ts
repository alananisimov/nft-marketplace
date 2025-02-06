import "reflect-metadata";

import type { PhotoSize } from "telegraf/types";
import { inject, injectable } from "tsyringe";

import { CreateNFTInput } from "@acme/api/modules/nft/application/dto";

import type { FileService } from "./file.service";
import type { BotContext, NFTSceneSession } from "~/types";
import { BotError } from "~/utils/errors";
import { confirmationKeyboard } from "~/utils/keyboard";
import { BaseService } from "./base.service";
import { api } from "~/utils/trpc";

@injectable()
export class NFTService extends BaseService {
  constructor(
    @inject("FileService")
    private readonly fileService: FileService,
  ) {
    super();
  }

  async getNFTs() {
    try {
      return await api.nft.all.query();
    } catch (error) {
      console.error("Failed to get nfts:", error);
      throw new BotError(
        "Failed to get NFTs. Please try again.",
        "FETCH_ERROR",
      );
    }
  }

  async listNFTs(ctx: BotContext) {
    try {
      const nfts = await api.nft.all.query();

      if (nfts.length === 0) {
        await this.returnToMainMenu(ctx, "No NFTs found.");
        return;
      }

      await this.handlePagination(
        ctx,
        nfts,
        (nft) => `
<b>${nft.name}</b>
Asset Code: ${nft.assetCode}
Description: ${nft.description}
Lockup Period: ${nft.lockupPeriod} days
ID: <code>${nft.id}</code>
`,
        "🎨 Available NFTs:",
      );
    } catch (error) {
      console.error("Failed to fetch NFTs:", error);
      throw new BotError(
        "Failed to fetch NFTs. Please try again later.",
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
        width: 800,
        height: 800,
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

  async createNFT(ctx: BotContext, input: CreateNFTInput) {
    try {
      const nft = await api.nft.create.mutate(input);

      await this.returnToMainMenu(
        ctx,
        `✅ NFT created successfully!\nNFT ID: ${nft.id}`,
      );

      return nft;
    } catch (error) {
      console.error("Failed to create NFT:", error);
      throw new BotError(
        "Failed to create NFT. Please try again later.",
        "CREATE_ERROR",
      );
    }
  }

  async confirmNFTCreation(ctx: BotContext) {
    const session = ctx.scene.session as NFTSceneSession;
    const nftData = session.nftData;

    const validatedData = await CreateNFTInput.parseAsync(nftData);

    const collection = await api.collection.byId.query({
      id: validatedData.collectionId,
    });

    const confirmationMessage = [
      "<b>Please confirm NFT details:</b>",
      `Collection: ${collection.name}`,
      `Asset Code: ${validatedData.assetCode}`,
      `Name: ${validatedData.name}`,
      `Description: ${validatedData.description}`,
      `Image URL: ${validatedData.image}`,
      `Lockup Period: ${validatedData.lockupPeriod} days`,
      `Domain: ${validatedData.domain}`,
      `Code: ${validatedData.code}`,
    ].join("\n");

    await ctx.reply(confirmationMessage, {
      parse_mode: "HTML",
      ...confirmationKeyboard,
    });
  }

  async getNFTsByCollection(collectionId: string) {
    try {
      return await api.nft.byCollection.query({
        collectionId,
      });
    } catch (error) {
      console.error("Failed to fetch NFTs by collection:", error);
      throw new BotError(
        "Failed to fetch NFTs. Please try again later.",
        "FETCH_ERROR",
      );
    }
  }
}
