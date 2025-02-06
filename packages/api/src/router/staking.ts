import { z } from "zod";

import {
  CreateStakingInput,
  ExtendedStakingResponse,
  StakingResponse,
} from "../modules/staking/application/dto";
import { protectedProcedure } from "../trpc";
import { logger } from "../utils/logger";
import { StakingService } from "../modules/staking/application/staking.service";

export const stakingRouter = {
  create: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/staking",
        tags: ["Staking"],
        summary: "Create new staking",
        protect: true,
      },
    })
    .input(CreateStakingInput)
    .output(StakingResponse)
    .mutation(async ({ input, ctx }) => {
      logger.info(
        {
          data: {
            nftId: input.nftId,
            nftRewardId: input.nftRewardId,
          },
        },
        "Creating new staking",
      );
      try {
        return await ctx.container.resolve(StakingService).createStaking(input);
      } catch (error) {
        logger.error({ error }, "Failed to create staking");
        throw error;
      }
    }),

  byNFT: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/staking/nft/{nftId}",
        tags: ["Staking"],
        summary: "Get staking by NFT ID",
        protect: true,
      },
    })
    .input(z.object({ nftId: z.string().uuid() }))
    .output(StakingResponse)
    .query(async ({ input, ctx }) => {
      logger.info({ nftId: input.nftId }, "Fetching staking by NFT");
      try {
        return await ctx.container
          .resolve(StakingService)
          .getStakingByNftId(input.nftId);
      } catch (error) {
        logger.error({ error }, "Failed to fetch staking");
        throw error;
      }
    }),

  my: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/staking/my",
        tags: ["Staking"],
        summary: "Get my stakings",
        protect: true,
      },
    })
    .input(z.void())
    .output(z.array(ExtendedStakingResponse))
    .query(async ({ ctx }) => {
      logger.info(
        {
          data: {
            userId: ctx.session.user.userId,
          },
        },
        "Fetching user stakings",
      );
      try {
        return await ctx.container
          .resolve(StakingService)
          .getUserStakings(ctx.session.user.userId);
      } catch (error) {
        logger.error({ error }, "Failed to fetch user stakings");
        throw error;
      }
    }),

  // TODO
  withdraw: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/staking/{nftId}/withdraw",
        tags: ["Staking"],
        summary: "Withdraw NFT from staking",
        protect: true,
      },
    })
    .input(
      z.object({
        nftId: z.string().uuid(),
      }),
    )
    .output(z.void())
    .mutation(async ({ input }) => {
      logger.debug({ nftId: input.nftId }, "Creating new withdraw for NFT");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }),
};
