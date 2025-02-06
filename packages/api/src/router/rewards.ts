import { z } from "zod";

import {
  CreateNFTRewardInput,
  CreateRewardInput,
  NFTRewardResponse,
  RewardResponse,
} from "../modules/reward/application/dto";
import { RewardService } from "../modules/reward/application/reward.service";

import { protectedProcedure, publicProcedure } from "../trpc";
import { logger } from "../utils/logger";

export const rewardRouter = {
  all: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/rewards",
        tags: ["Rewards"],
        summary: "Get all rewards",
      },
    })
    .input(z.void())
    .output(z.array(RewardResponse))
    .query(async ({ ctx }) => {
      logger.info("Fetching all Rewards");
      try {
        return await ctx.container.resolve(RewardService).getAllRewards();
      } catch (error) {
        logger.error({ error }, "Failed to fetch Rewards");
        throw error;
      }
    }),

  byNFTId: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/rewards/nft/{id}",
        tags: ["Rewards"],
        summary: "Get rewards by NFT ID",
      },
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.array(NFTRewardResponse))
    .query(async ({ input, ctx }) => {
      logger.info(`Fetching Rewards by NFT ID: ${input.id}`);
      try {
        return await ctx.container
          .resolve(RewardService)
          .getRewardsByNFT(input.id);
      } catch (error) {
        logger.error(
          {
            data: {
              error,
            },
          },
          `Failed to fetch Rewards with NFT ID ${input.id}`,
        );
        throw error;
      }
    }),

  byId: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/rewards/{id}",
        tags: ["Rewards"],
        summary: "Get rewards by ID",
      },
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(RewardResponse)
    .query(async ({ input, ctx }) => {
      logger.info(`Fetching Rewards by ID: ${input.id}`);
      try {
        return await ctx.container
          .resolve(RewardService)
          .getRewardById(input.id);
      } catch (error) {
        logger.error(
          {
            data: {
              error,
            },
          },
          `Failed to fetch Rewards with ID ${input.id}`,
        );
        throw error;
      }
    }),
  create: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/rewards",
        tags: ["Rewards"],
        summary: "Create new reward",
        protect: true,
      },
    })
    .input(CreateRewardInput)
    .output(RewardResponse)
    .mutation(async ({ input, ctx }) => {
      logger.info({ name: input.name }, "Creating new Reward");
      try {
        return await ctx.container.resolve(RewardService).createReward(input);
      } catch (error) {
        logger.error({ error }, "Failed to create Reward");
        throw error;
      }
    }),

  attachToNFT: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/rewards/attach",
        tags: ["Rewards"],
        summary: "Attach reward to NFT",
        protect: true,
      },
    })
    .input(CreateNFTRewardInput)
    .output(NFTRewardResponse)
    .mutation(async ({ input, ctx }) => {
      logger.info(
        {
          data: {
            nftId: input.nftId,
            rewardId: input.rewardId,
          },
        },
        "Attaching Reward to NFT",
      );
      try {
        return await ctx.container
          .resolve(RewardService)
          .attachRewardToNFT(input);
      } catch (error) {
        logger.error({ error }, "Failed to attach Reward to NFT");
        throw error;
      }
    }),

  delete: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/rewards/{id}",
        tags: ["Rewards"],
        summary: "Delete reward",
        protect: true,
      },
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      logger.info({ id: input.id }, "Deleting Reward");
      try {
        await ctx.container.resolve(RewardService).deleteReward(input.id);
      } catch (error) {
        logger.error({ error }, "Failed to delete Reward");
        throw error;
      }
    }),
};
