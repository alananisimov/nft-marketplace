import "reflect-metadata";

import { inject, injectable } from "tsyringe";

import type { DeliveryRepository } from "../infrastructure/delivery.repository";
import type {
  CreateDeliveryInput,
  DeliveryResponse,
  DeliveryResponseWithNFT,
} from "./dto";
import { CACHE_CONFIG } from "../../../constants";
import { DomainError, NotFoundError } from "../../../shared/domain/errors";
import { cacheService } from "../../../shared/infrastructure/cache";

import { logger } from "../../../utils/logger";
import { DeliveryEntity } from "../domain/delivery.entity";

@injectable()
export class DeliveryService {
  constructor(
    @inject("DeliveryRepository")
    private readonly deliveryRepository: DeliveryRepository,
  ) {}

  async createDelivery(
    input: CreateDeliveryInput & { userId: string },
  ): Promise<DeliveryResponse> {
    logger.info({ input }, "Creating new delivery");

    try {
      const delivery = DeliveryEntity.create({
        ...input,
        ordered: new Date(),
        userId: input.userId,
      });

      const savedDelivery = await this.deliveryRepository.create(delivery);

      await cacheService.del(`delivery:${input.nftId}`);
      await cacheService.del(`user_deliveries:${input.userId}`);

      logger.info({ id: savedDelivery.id }, "Successfully created delivery");
      return savedDelivery.toDTO();
    } catch (error) {
      logger.error({ error, input }, "Failed to create delivery");
      throw error instanceof DomainError
        ? error
        : new DomainError("Failed to create delivery", "DELIVERY_CREATE_ERROR");
    }
  }

  async getDeliveryByNftId(nftId: string): Promise<DeliveryResponseWithNFT> {
    logger.info({ nftId }, "Fetching delivery by NFT ID");

    try {
      const cached = await cacheService.get<DeliveryResponseWithNFT>(
        `delivery:${nftId}`,
      );
      if (cached) {
        logger.info({ nftId }, "Returning cached delivery");
        return cached;
      }

      const delivery = await this.deliveryRepository.findByNftId(nftId);
      if (!delivery) {
        throw new NotFoundError("Delivery", nftId);
      }

      const response = delivery.toDTOWithNFT();

      await cacheService.set(
        `delivery:${nftId}`,
        response,
        CACHE_CONFIG.revalidate.protected,
      );

      logger.info({ nftId }, "Successfully fetched delivery");
      return response;
    } catch (error) {
      logger.error({ error, nftId }, "Failed to fetch delivery");
      throw error instanceof DomainError
        ? error
        : new DomainError("Failed to fetch delivery", "DELIVERY_FETCH_ERROR");
    }
  }

  async getUserDeliveries(userId: string): Promise<DeliveryResponseWithNFT[]> {
    logger.info({ userId }, "Fetching user deliveries");

    try {
      const cached = await cacheService.get<DeliveryResponseWithNFT[]>(
        `user_deliveries:${userId}`,
      );
      if (cached) {
        logger.info({ userId }, "Returning cached user deliveries");
        return cached;
      }

      const deliveries = await this.deliveryRepository.findAll();

      if (!deliveries.length) {
        logger.info({ userId }, "No deliveries found for user");
        return [];
      }

      const responses = deliveries.map((delivery) => delivery.toDTOWithNFT());

      await cacheService.set(
        `user_deliveries:${userId}`,
        responses,
        CACHE_CONFIG.revalidate.protected,
      );

      logger.info(
        { data: { userId, count: responses.length } },
        "Successfully fetched user deliveries",
      );
      return responses;
    } catch (error) {
      logger.error({ error, userId }, "Failed to fetch user deliveries");
      throw error instanceof DomainError
        ? error
        : new DomainError(
            "Failed to fetch user deliveries",
            "DELIVERIES_FETCH_ERROR",
          );
    }
  }
}
