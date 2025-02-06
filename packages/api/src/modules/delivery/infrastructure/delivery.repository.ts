import { eq } from "drizzle-orm";

import { db } from "@acme/db/client";
import { DeliveryItem } from "@acme/db/schema";

import type { IRepository } from "../../../shared/domain/types";
import { DomainError } from "../../../shared/domain/errors";
import { logger } from "../../../utils/logger";
import { DeliveryEntity } from "../domain/delivery.entity";

export class DeliveryRepository implements IRepository<DeliveryEntity> {
  async findById(id: string): Promise<DeliveryEntity | null> {
    try {
      logger.debug({ id }, "Finding delivery by ID");

      const result = await db.query.DeliveryItem.findFirst({
        where: eq(DeliveryItem.id, id),
        with: {
          nft: true,
        },
      });

      if (!result) {
        logger.debug({ id }, "Delivery not found");
        return null;
      }

      logger.debug({ id }, "Found delivery");
      return DeliveryEntity.fromDB(result);
    } catch (error) {
      logger.error({ error, id }, "Error finding delivery by ID");
      throw new DomainError("Failed to find delivery", "REPOSITORY_ERROR");
    }
  }

  async findAll(): Promise<DeliveryEntity[]> {
    try {
      logger.debug("Finding all deliveries");

      const results = await db.query.DeliveryItem.findMany({
        with: {
          nft: true,
        },
      });

      logger.debug({ count: results.length }, "Found deliveries");
      return results.map((delivery) => DeliveryEntity.fromDB(delivery));
    } catch (error) {
      logger.error({ error }, "Error finding all deliveries");
      throw new DomainError(
        "Failed to fetch deliveries from repository",
        "REPOSITORY_ERROR",
      );
    }
  }

  async findByNftId(nftId: string): Promise<DeliveryEntity | null> {
    try {
      logger.debug({ nftId }, "Finding delivery by NFT ID");

      const result = await db.query.DeliveryItem.findFirst({
        where: eq(DeliveryItem.nftId, nftId),
        with: {
          nft: true,
        },
      });

      if (!result) {
        logger.debug({ nftId }, "Delivery not found");
        return null;
      }

      logger.debug({ id: result.id }, "Found delivery");
      return DeliveryEntity.fromDB(result);
    } catch (error) {
      logger.error({ error, nftId }, "Error finding delivery by NFT ID");
      throw new DomainError("Failed to find delivery", "REPOSITORY_ERROR");
    }
  }

  async findByUserId(userId: string): Promise<DeliveryEntity | null> {
    try {
      logger.debug({ userId }, "Finding delivery by user ID");

      const result = await db.query.DeliveryItem.findFirst({
        where: eq(DeliveryItem.userId, userId),
        with: {
          nft: true,
        },
      });

      if (!result) {
        logger.debug({ userId }, "Delivery not found");
        return null;
      }

      logger.debug({ id: result.id }, "Found delivery");
      return DeliveryEntity.fromDB(result);
    } catch (error) {
      logger.error({ error, userId }, "Error finding delivery by user ID");
      throw new DomainError("Failed to find delivery", "REPOSITORY_ERROR");
    }
  }

  async create(entity: DeliveryEntity): Promise<DeliveryEntity> {
    try {
      logger.debug({ entity }, "Creating delivery");

      const [result] = await db
        .insert(DeliveryItem)
        .values({
          id: entity.id,
          userId: entity.userId,
          nftId: entity.nftId,
          address: entity.address,
          lockDate: entity.lockDate,
          ordered: entity.ordered,
          processed: entity.processed,
          estimated: entity.estimated,
        })
        .returning();

      if (!result) {
        throw new DomainError(
          "Failed to insert delivery into database",
          "REPOSITORY_ERROR",
        );
      }

      const deliveryWithNft = await db.query.DeliveryItem.findFirst({
        where: eq(DeliveryItem.id, result.id),
        with: {
          nft: true,
        },
      });

      if (!deliveryWithNft?.nft) {
        throw new DomainError(
          "Failed to fetch delivery with NFT",
          "REPOSITORY_ERROR",
        );
      }

      logger.debug({ id: result.id }, "Created delivery");
      return DeliveryEntity.fromDB(deliveryWithNft);
    } catch (error) {
      logger.error({ error, entity }, "Error creating delivery");
      throw new DomainError("Failed to create delivery", "REPOSITORY_ERROR");
    }
  }

  async update(
    id: string,
    updates: Partial<typeof DeliveryItem.$inferSelect>,
  ): Promise<DeliveryEntity> {
    try {
      logger.debug({ id, updates }, "Updating delivery");

      const [result] = await db
        .update(DeliveryItem)
        .set({
          ...updates,
        })
        .where(eq(DeliveryItem.id, id))
        .returning();

      if (!result) {
        throw new DomainError(
          "Failed to update delivery in database",
          "REPOSITORY_ERROR",
        );
      }

      const nft = await db.query.DeliveryItem.findFirst({
        where: eq(DeliveryItem.id, result.id),
        with: {
          nft: true,
        },
        columns: {},
      });

      if (!nft?.nft) {
        throw new DomainError(
          "Failed to update delivery in database",
          "REPOSITORY_ERROR",
        );
      }

      logger.debug({ id }, "Updated delivery");
      return DeliveryEntity.fromDB({ ...result, nft: nft.nft });
    } catch (error) {
      logger.error({ error, id, updates }, "Error updating delivery");
      throw new DomainError("Failed to update delivery", "REPOSITORY_ERROR");
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      logger.debug({ id }, "Deleting delivery");

      const [result] = await db
        .delete(DeliveryItem)
        .where(eq(DeliveryItem.id, id))
        .returning();

      const success = !!result;
      logger.debug({ id, success }, "Deleted delivery");
      return success;
    } catch (error) {
      logger.error({ error, id }, "Error deleting delivery");
      throw new DomainError("Failed to delete delivery", "REPOSITORY_ERROR");
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      logger.debug({ id }, "Checking delivery existence");

      const result = await db.query.DeliveryItem.findFirst({
        where: eq(DeliveryItem.id, id),
        columns: {
          id: true,
        },
      });

      const exists = !!result;
      logger.debug({ id, exists }, "Checked delivery existence");
      return exists;
    } catch (error) {
      logger.error({ error, id }, "Error checking delivery existence");
      throw new DomainError(
        "Failed to check delivery existence",
        "REPOSITORY_ERROR",
      );
    }
  }
}
