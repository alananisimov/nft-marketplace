import "reflect-metadata";

import { injectable } from "tsyringe";

import type { CreateCollectionInput } from "@acme/api/modules/collection/application/dto";

import type { BotContext, CollectionSceneSession } from "~/types";
import { BotError } from "~/utils/errors";
import { confirmationKeyboard } from "~/utils/keyboard";
import { BaseService } from "./base.service";
import { api } from "~/utils/trpc";

@injectable()
export class CollectionService extends BaseService {
  async getAllCollections() {
    try {
      return await api.collection.all.query();
    } catch (error) {
      console.error("Failed to fetch collections:", error);
      throw new BotError(
        "Failed to fetch collections. Please try again later.",
        "FETCH_ERROR",
      );
    }
  }

  async listCollections(ctx: BotContext) {
    try {
      const collections = await this.getAllCollections();

      if (collections.length === 0) {
        await this.returnToMainMenu(ctx, "No collections found.");
        return;
      }

      await this.handlePagination(
        ctx,
        collections,
        (collection) => `
<b>${collection.name}</b>
Description: ${collection.description}
NFTs Count: ${collection.nfts.length}
ID: <code>${collection.id}</code>
`,
        "📚 Available Collections:",
      );
    } catch (error) {
      console.error("Failed to list collections:", error);
      throw new BotError(
        "Failed to list collections. Please try again later.",
        "FETCH_ERROR",
      );
    }
  }

  async createCollection(ctx: BotContext, input: CreateCollectionInput) {
    try {
      const collection = await api.collection.create.mutate(input);

      await this.returnToMainMenu(
        ctx,
        `✅ Collection created successfully!\nCollection ID: ${collection.id}`,
      );

      ctx.session.collection = {};
      return collection;
    } catch (error) {
      console.error("Failed to create collection:", error);
      throw new BotError(
        "Failed to create collection. Please try again later.",
        "CREATE_ERROR",
      );
    }
  }

  async confirmCollectionCreation(ctx: BotContext) {
    const { name, description } = ctx.session
      .collection as CollectionSceneSession["collection"];

    if (!name || !description) {
      throw new BotError(
        "Missing collection details. Please start over.",
        "VALIDATION_ERROR",
      );
    }

    const confirmationMessage = [
      "<b>Please confirm collection details:</b>",
      `Name: ${name}`,
      `Description: ${description}`,
    ].join("\n");

    await ctx.reply(confirmationMessage, {
      parse_mode: "HTML",
      ...confirmationKeyboard,
    });
  }
}
