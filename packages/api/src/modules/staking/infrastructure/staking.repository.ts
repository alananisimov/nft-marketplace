import { eq } from "drizzle-orm";

import { db } from "@acme/db/client";
import { NFT, NFTReward, StakingItem } from "@acme/db/schema";

import type { IRepository } from "../../../shared/domain/types";
import { DomainError } from "../../../shared/domain/errors";
import { logger } from "../../../utils/logger";
import { StakingEntity } from "../domain/staking.entity";

export class StakingRepository implements IRepository<StakingEntity> {
  async findById(id: string): Promise<StakingEntity | null> {
    try {
      logger.debug({ id }, "Finding staking by ID");

      const result = await db.query.StakingItem.findFirst({
        where: eq(StakingItem.id, id),
        with: {
          nft: true,
          nftReward: {
            with: {
              reward: true,
            },
          },
        },
      });

      if (!result) {
        logger.debug({ id }, "Staking not found");
        return null;
      }

      logger.debug({ id }, "Found staking");
      return StakingEntity.fromDB(result);
    } catch (error) {
      logger.error({ error, id }, "Error finding staking by ID");
      throw new DomainError("Failed to find staking", "REPOSITORY_ERROR");
    }
  }

  async findByNftId(nftId: string): Promise<StakingEntity | null> {
    try {
      logger.debug({ nftId }, "Finding staking by NFT ID");

      const result = await db.query.StakingItem.findFirst({
        where: eq(StakingItem.nftId, nftId),
        with: {
          nft: true,
          nftReward: {
            with: {
              reward: true,
            },
          },
        },
      });

      if (!result) {
        logger.debug({ nftId }, "Staking not found");
        return null;
      }

      logger.debug({ id: result.id }, "Found staking");
      return StakingEntity.fromDB(result);
    } catch (error) {
      logger.error({ error, nftId }, "Error finding staking by NFT ID");
      throw new DomainError("Failed to find staking", "REPOSITORY_ERROR");
    }
  }

  async findByUser(userId: string): Promise<StakingEntity[]> {
    try {
      logger.debug("Finding stakings by User ID");

      const results = await db.query.StakingItem.findMany({
        where: eq(StakingItem.userId, userId),
        with: {
          nft: true,
          nftReward: {
            with: {
              reward: true,
            },
          },
        },
      });

      logger.debug({ count: results.length }, "Found stakings");
      return results.map((staking) => StakingEntity.fromDB(staking));
    } catch (error) {
      logger.error({ error }, "Error finding all stakings");
      throw new DomainError("Failed to find stakings", "REPOSITORY_ERROR");
    }
  }

  async findAll(): Promise<StakingEntity[]> {
    try {
      logger.debug("Finding all stakings");

      const results = await db.query.StakingItem.findMany({
        with: {
          nft: true,
          nftReward: {
            with: {
              reward: true,
            },
          },
        },
      });

      logger.debug({ count: results.length }, "Found stakings");
      return results.map((staking) => StakingEntity.fromDB(staking));
    } catch (error) {
      logger.error({ error }, "Error finding all stakings");
      throw new DomainError("Failed to find stakings", "REPOSITORY_ERROR");
    }
  }

  async create(entity: StakingEntity): Promise<StakingEntity> {
    try {
      logger.debug({ entity }, "Creating staking");

      const [result] = await db
        .insert(StakingItem)
        .values({
          id: entity.id,
          nftId: entity.nftId,
          lockupPeriod: entity.lockupPeriod,
          nftRewardId: entity.nftRewardId,
          userId: entity.userId,
        })
        .returning();

      if (!result) {
        throw new DomainError(
          "Failed to insert staking into database",
          "REPOSITORY_ERROR",
        );
      }

      logger.debug({ id: result.id }, "Created staking");
      return entity;
    } catch (error) {
      logger.error({ error, entity }, "Error creating staking");
      throw new DomainError("Failed to create staking", "REPOSITORY_ERROR");
    }
  }

  async update(
    id: string,
    updates: Partial<typeof StakingItem.$inferSelect>,
  ): Promise<StakingEntity> {
    try {
      logger.debug({ id, updates }, "Updating staking");

      const [result] = await db
        .update(StakingItem)
        .set(updates)
        .where(eq(StakingItem.id, id))
        .returning();

      if (!result) {
        throw new DomainError(
          "Failed to update staking in database",
          "REPOSITORY_ERROR",
        );
      }

      const nft = await db.query.NFT.findFirst({
        where: eq(NFT.id, result.nftId),
      });

      if (!nft) {
        throw new DomainError(
          "Failed to find NFT for staking",
          "REPOSITORY_ERROR",
        );
      }
      const nftReward = await db.query.NFTReward.findFirst({
        where: eq(NFTReward.id, result.nftRewardId),
        with: {
          reward: true,
        },
      });

      if (!nftReward) {
        throw new DomainError(
          "Failed to find NFT Reward for staking",
          "REPOSITORY_ERROR",
        );
      }

      logger.debug({ id }, "Updated staking");
      return StakingEntity.fromDB({
        ...result,
        nft: nft,
        nftReward: nftReward,
      });
    } catch (error) {
      logger.error({ error, id, updates }, "Error updating staking");
      throw new DomainError("Failed to update staking", "REPOSITORY_ERROR");
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      logger.debug({ id }, "Deleting staking");

      const [result] = await db
        .delete(StakingItem)
        .where(eq(StakingItem.id, id))
        .returning();

      const success = !!result;
      logger.debug({ id, success }, "Deleted staking");
      return success;
    } catch (error) {
      logger.error({ error, id }, "Error deleting staking");
      throw new DomainError("Failed to delete staking", "REPOSITORY_ERROR");
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      logger.debug({ id }, "Checking staking existence");

      const result = await db.query.StakingItem.findFirst({
        where: eq(StakingItem.id, id),
        columns: {
          id: true,
        },
      });

      const exists = !!result;
      logger.debug({ id, exists }, "Checked staking existence");
      return exists;
    } catch (error) {
      logger.error({ error, id }, "Error checking staking existence");
      throw new DomainError(
        "Failed to check staking existence",
        "REPOSITORY_ERROR",
      );
    }
  }
}
