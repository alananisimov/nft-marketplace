import "reflect-metadata";

import { eq } from "drizzle-orm";

import { db } from "@acme/db/client";
import { NFTReward, Reward } from "@acme/db/schema";

import { DomainError } from "../../../shared/domain/errors";
import { logger } from "../../../utils/logger";
import { NFTRewardEntity, RewardEntity } from "../domain/reward.entity";

export class RewardRepository {
  async create(entity: RewardEntity): Promise<RewardEntity> {
    try {
      logger.debug({ entity }, "Creating Reward");

      const [result] = await db
        .insert(Reward)
        .values(entity.toDTO())
        .returning();

      if (!result) {
        throw new DomainError(
          "Failed to insert reward into database",
          "REPOSITORY_ERROR",
        );
      }

      logger.debug({ id: result.id }, "Created Reward");
      return RewardEntity.fromDB(result);
    } catch (error) {
      logger.error({ error, entity }, "Error creating Reward");
      throw error instanceof DomainError
        ? error
        : new DomainError("Failed to create Reward", "REPOSITORY_ERROR");
    }
  }

  async attachToNFT(entity: NFTRewardEntity): Promise<NFTRewardEntity> {
    try {
      logger.debug({ entity }, "Attaching Reward to NFT");

      const [result] = await db
        .insert(NFTReward)
        .values({
          nftId: entity.nftId,
          rewardId: entity.rewardId,
          monthlyPercentage: entity.monthlyPercentage,
        })
        .returning();

      if (!result) {
        throw new DomainError(
          "Failed to attach reward to NFT",
          "REPOSITORY_ERROR",
        );
      }

      const nftReward = await db.query.NFTReward.findFirst({
        where: eq(NFTReward.id, result.id),
        with: {
          reward: true,
        },
      });

      if (!nftReward) {
        throw new DomainError(
          "Failed to fetch created NFT reward",
          "REPOSITORY_ERROR",
        );
      }

      logger.debug({ id: result.id }, "Attached Reward to NFT");
      return NFTRewardEntity.fromDB(nftReward);
    } catch (error) {
      logger.error({ error, entity }, "Error attaching Reward to NFT");
      throw error instanceof DomainError
        ? error
        : new DomainError("Failed to attach Reward to NFT", "REPOSITORY_ERROR");
    }
  }

  async findByNFTId(nftId: string): Promise<NFTRewardEntity[]> {
    try {
      logger.debug({ nftId }, "Finding Rewards by NFT");

      const results = await db.query.NFTReward.findMany({
        where: eq(NFTReward.nftId, nftId),
        with: {
          reward: true,
        },
      });

      logger.debug(
        {
          data: {
            nftId,
            count: results.length,
          },
        },
        "Found NFT rewards",
      );

      return results.map((result) => NFTRewardEntity.fromDB(result));
    } catch (error) {
      logger.error({ error, nftId }, "Error finding Rewards by NFT");
      throw new DomainError("Failed to find NFT Rewards", "REPOSITORY_ERROR");
    }
  }

  async findById(id: string): Promise<RewardEntity | null> {
    try {
      logger.debug({ id }, "Finding Reward by ID");

      const result = await db.query.Reward.findFirst({
        where: eq(Reward.id, id),
      });

      if (!result) {
        logger.debug({ id }, "Reward not found");
        return null;
      }

      logger.debug({ id }, "Found Reward");
      return RewardEntity.fromDB(result);
    } catch (error) {
      logger.error({ error, id }, "Error finding Reward by ID");
      throw new DomainError("Failed to find Reward", "REPOSITORY_ERROR");
    }
  }

  async findNFTRewardById(id: string): Promise<NFTRewardEntity | null> {
    try {
      logger.debug({ id }, "Finding Reward by ID");

      const result = await db.query.NFTReward.findFirst({
        where: eq(NFTReward.id, id),
        with: {
          reward: true,
        },
      });

      if (!result) {
        logger.debug({ id }, "Reward not found");
        return null;
      }

      logger.debug({ id }, "Found Reward");
      return NFTRewardEntity.fromDB(result);
    } catch (error) {
      logger.error({ error, id }, "Error finding Reward by ID");
      throw new DomainError("Failed to find Reward", "REPOSITORY_ERROR");
    }
  }

  async findAll(): Promise<RewardEntity[]> {
    try {
      logger.debug("Finding all Rewards");

      const results = await db.query.Reward.findMany();

      logger.debug({ count: results.length }, "Found Rewards");
      return results.map((reward) => RewardEntity.fromDB(reward));
    } catch (error) {
      logger.error({ error }, "Error finding all Rewards");
      throw new DomainError("Failed to find Rewards", "REPOSITORY_ERROR");
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      logger.debug({ id }, "Checking NFT existence");

      const result = await db.query.NFTReward.findFirst({
        where: eq(NFTReward.id, id),
        columns: {
          id: true,
        },
      });

      const exists = !!result;
      logger.debug({ id, exists }, "Checked NFT existence");
      return exists;
    } catch (error) {
      logger.error({ error, id }, "Error checking NFT existence");
      throw new DomainError(
        "Failed to check NFT existence",
        "REPOSITORY_ERROR",
      );
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      logger.debug({ id }, "Deleting Reward");

      const [result] = await db
        .delete(Reward)
        .where(eq(Reward.id, id))
        .returning();

      const success = !!result;
      logger.debug({ id, success }, "Deleted Reward");
      return success;
    } catch (error) {
      logger.error({ error, id }, "Error deleting Reward");
      throw new DomainError("Failed to delete Reward", "REPOSITORY_ERROR");
    }
  }
}
