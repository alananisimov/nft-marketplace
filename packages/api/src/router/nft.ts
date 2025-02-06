import { z } from "zod";

import {
  CreateNFTInput,
  NFTResponseWithMarketData,
} from "../modules/nft/application/dto";
import { NFTService } from "../modules/nft/application/nft.service";

import { adminProcedure, protectedProcedure, publicProcedure } from "../trpc";
import { logger } from "../utils/logger";

export const nftRouter = {
  all: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/nfts",
        tags: ["NFTs"],
        summary: "Get all NFTs",
      },
    })
    .input(z.void())
    .output(z.array(NFTResponseWithMarketData))
    .query(async ({ ctx }) => {
      logger.info("Fetching all NFTs");
      try {
        return await ctx.container.resolve(NFTService).getAllNFTs();
      } catch (error) {
        logger.error({ error }, "Failed to fetch NFTs");
        throw error;
      }
    }),

  my: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/nfts/my",
        tags: ["NFTs"],
        summary: "Get my NFTs",
        protect: true,
      },
    })
    .input(z.void())
    .output(z.array(NFTResponseWithMarketData))
    .query(async ({ ctx }) => {
      logger.info(
        { data: ctx.session.user.publicKey },
        "Fetching NFTs for user with id",
      );
      try {
        return await ctx.container
          .resolve(NFTService)
          .getUserNFTsWithMD(ctx.session.user.publicKey);
      } catch (error) {
        logger.error({ error }, "Failed to fetch NFTs");
        throw error;
      }
    }),

  available: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/nfts/available",
        tags: ["NFTs"],
        summary: "Get available NFTs",
        protect: true,
      },
    })
    .input(z.void())
    .output(z.array(NFTResponseWithMarketData))
    .query(async ({ ctx }) => {
      logger.info(
        "Fetching available NFTs for user with id",
        ctx.session.user.publicKey,
      );
      try {
        return await ctx.container
          .resolve(NFTService)
          .getAvailableNFTs(
            ctx.session.user.userId,
            ctx.session.user.publicKey,
          );
      } catch (error) {
        logger.error({ error }, "Failed to fetch NFTs");
        throw error;
      }
    }),

  byCollection: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/nfts/collection/{collectionId}",
        tags: ["NFTs"],
        summary: "Get NFTs by collection ID",
      },
    })
    .input(
      z.object({
        collectionId: z.string().uuid(),
      }),
    )
    .output(z.array(NFTResponseWithMarketData))
    .query(async ({ input, ctx }) => {
      logger.info(
        { collectionId: input.collectionId },
        "Fetching NFTs by collection ID",
      );
      try {
        return await ctx.container
          .resolve(NFTService)
          .getNFTsByCollection(input.collectionId);
      } catch (error) {
        logger.error(
          { error, collectionId: input.collectionId },
          "Failed to fetch NFTs by collection",
        );
        throw error;
      }
    }),

  byId: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/nfts/{id}",
        tags: ["NFTs"],
        summary: "Get NFT by ID",
      },
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(NFTResponseWithMarketData)
    .query(async ({ input, ctx }) => {
      logger.info(`Fetching NFT by ID: ${input.id}`);
      try {
        return await ctx.container.resolve(NFTService).getNFTById(input.id);
      } catch (error) {
        logger.error({ error }, `Failed to fetch NFT ${input.id}`);
        throw error;
      }
    }),

  delete: adminProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/nfts/{id}",
        tags: ["NFTs"],
        summary: "Delete NFT",
        protect: true,
      },
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      logger.info({ id: input.id }, "Deleting NFT");
      try {
        return await ctx.container.resolve(NFTService).deleteNFT(input.id);
      } catch (error) {
        logger.error({ error }, "Failed to delete NFT");
        throw error;
      }
    }),

  create: adminProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/nfts",
        tags: ["NFTs"],
        summary: "Create new NFT",
        protect: true,
      },
    })
    .input(CreateNFTInput)
    .output(NFTResponseWithMarketData)
    .mutation(async ({ input, ctx }) => {
      logger.info({ name: input.name }, "Creating new NFT");
      try {
        return await ctx.container.resolve(NFTService).createNFT(input);
      } catch (error) {
        logger.error({ error }, "Failed to create NFT");
        throw error;
      }
    }),
};
