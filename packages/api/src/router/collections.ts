import { z } from "zod";

import {
  CollectionResponse,
  CreateCollectionInput,
} from "../modules/collection/application/dto";

import { protectedProcedure, publicProcedure } from "../trpc";
import { logger } from "../utils/logger";
import { CollectionService } from "../modules/collection/application/collection.service";

export const collectionRouter = {
  all: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/collections",
        tags: ["Collections"],
        summary: "Get all collections",
      },
    })
    .input(z.void())
    .output(z.array(CollectionResponse))
    .query(async ({ ctx }) => {
      logger.info("Fetching all collections");
      try {
        return await ctx.container
          .resolve(CollectionService)
          .getAllCollections();
      } catch (error) {
        logger.error({ error }, "Failed to fetch collections");
        throw error;
      }
    }),

  my: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/collections/my",
        tags: ["Collections"],
        summary: "Get user collections",
        protect: true,
      },
    })
    .input(z.void())
    .output(z.array(CollectionResponse))
    .query(async ({ ctx }) => {
      logger.info("Fetching user collections");
      try {
        return await ctx.container
          .resolve(CollectionService)
          .getUserCollections(ctx.session.user.publicKey);
      } catch (error) {
        logger.error({ error }, "Failed to fetch collections");
        throw error;
      }
    }),
  byId: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/collections/{id}",
        tags: ["Collections"],
        summary: "Get collection by ID",
      },
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(CollectionResponse)
    .query(async ({ input, ctx }) => {
      logger.info(`Fetching collection by ID: ${input.id}`);
      try {
        return await ctx.container
          .resolve(CollectionService)
          .getCollectionById(input.id);
      } catch (error) {
        logger.error({ error }, `Failed to fetch collection ${input.id}`);
        throw error;
      }
    }),

  create: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/collections",
        tags: ["Collections"],
        summary: "Create new collection",
        protect: true,
      },
    })
    .input(CreateCollectionInput)
    .output(CollectionResponse)
    .mutation(async ({ input, ctx }) => {
      logger.info({ name: input.name }, "Creating new collection");
      try {
        return await ctx.container
          .resolve(CollectionService)
          .createCollection(input);
      } catch (error) {
        logger.error({ error }, "Failed to create collection");
        throw error;
      }
    }),
};
