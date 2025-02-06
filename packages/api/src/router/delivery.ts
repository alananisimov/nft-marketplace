import { z } from "zod";

import { DeliveryService } from "../modules/delivery/application/delivery.service";
import {
  CreateDeliveryInput,
  DeliveryResponse,
  DeliveryResponseWithNFT,
} from "../modules/delivery/application/dto";
import { protectedProcedure } from "../trpc";
import { logger } from "../utils/logger";

export const deliveryRouter = {
  create: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/deliveries",
        tags: ["Deliveries"],
        summary: "Create new delivery",
        protect: true,
      },
    })
    .input(CreateDeliveryInput)
    .output(DeliveryResponse)
    .mutation(async ({ input, ctx }) => {
      logger.info({ nftId: input.nftId }, "Creating new delivery");
      try {
        return await ctx.container.resolve(DeliveryService).createDelivery({
          ...input,
          userId: ctx.session.user.userId,
        });
      } catch (error) {
        logger.error({ error }, "Failed to create delivery");
        throw error;
      }
    }),

  getById: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/deliveries/{nftId}",
        tags: ["Deliveries"],
        summary: "Get delivery by NFT ID",
        protect: true,
      },
    })
    .input(z.object({ nftId: z.string().uuid() }))
    .output(DeliveryResponseWithNFT)
    .query(async ({ input, ctx }) => {
      logger.info({ nftId: input.nftId }, "Fetching delivery");
      try {
        return await ctx.container
          .resolve(DeliveryService)
          .getDeliveryByNftId(input.nftId);
      } catch (error) {
        logger.error({ error }, "Failed to fetch delivery");
        throw error;
      }
    }),

  my: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/deliveries/my",
        tags: ["Deliveries"],
        summary: "Get my deliveries",
        protect: true,
      },
    })
    .input(z.void())
    .output(z.array(DeliveryResponseWithNFT))
    .query(async ({ ctx }) => {
      logger.info(
        {
          data: {
            userId: ctx.session.user.publicKey,
          },
        },
        "Fetching user deliveries",
      );
      try {
        return await ctx.container
          .resolve(DeliveryService)
          .getUserDeliveries(ctx.session.user.userId);
      } catch (error) {
        logger.error({ error }, "Failed to fetch user deliveries");
        throw error;
      }
    }),
};
