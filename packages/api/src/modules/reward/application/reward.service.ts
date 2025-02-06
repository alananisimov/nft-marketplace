import "reflect-metadata";

import { inject, injectable } from "tsyringe";

import type { RewardRepository } from "../infrastructure/reward.repository";
import type {
  CreateNFTRewardInput,
  CreateRewardInput,
  NFTRewardResponse,
  RewardResponse,
} from "./dto";
import { CACHE_CONFIG } from "../../../constants";
import { DomainError, NotFoundError } from "../../../shared/domain/errors";
import { cacheService } from "../../../shared/infrastructure/cache";

import { logger } from "../../../utils/logger";
import { NFTRewardEntity, RewardEntity } from "../domain/reward.entity";

@injectable()
export class RewardService {
  constructor(
    @inject("RewardRepository")
    private readonly rewardRepository: RewardRepository,
  ) {}

  private async invalidateRewardCaches(...keys: string[]): Promise<void> {
    await Promise.all([
      cacheService.del("all_rewards"),
      ...keys.map((key) => cacheService.del(`rewards:${key}`)),
    ]);
  }

  async createReward(input: CreateRewardInput): Promise<RewardResponse> {
    logger.info({ input }, "Creating new Reward");

    try {
      const reward = RewardEntity.create({
        ...input,
      });

      const savedReward = await this.rewardRepository.create(reward);

      await this.invalidateRewardCaches();

      logger.info({ id: savedReward.id }, "Successfully created Reward");
      return savedReward.toDTO();
    } catch (error) {
      logger.error({ error, input }, "Failed to create Reward");
      throw error instanceof DomainError
        ? error
        : new DomainError("Failed to create Reward", "REWARD_CREATE_ERROR");
    }
  }

  async attachRewardToNFT(
    input: CreateNFTRewardInput,
  ): Promise<NFTRewardResponse> {
    logger.info({ input }, "Attaching Reward to NFT");

    try {
      const reward = await this.rewardRepository.findById(input.rewardId);
      if (!reward) {
        throw new NotFoundError("Reward", input.rewardId);
      }

      const rewardEntity = NFTRewardEntity.create(input);

      const saved = await this.rewardRepository.attachToNFT(rewardEntity);

      await this.invalidateRewardCaches(input.nftId);

      logger.info({ input }, "Successfully attached Reward to NFT");
      return saved.toDTO();
    } catch (error) {
      logger.error({ error, input }, "Failed to attach Reward to NFT");
      throw error instanceof DomainError
        ? error
        : new DomainError(
            "Failed to attach Reward to NFT",
            "REWARD_ATTACH_ERROR",
          );
    }
  }

  async getRewardById(id: string): Promise<RewardResponse> {
    logger.info({ id }, "Fetching Reward by ID");

    try {
      const cached = await cacheService.get<RewardResponse>(`reward:${id}`);
      if (cached) {
        logger.info({ id }, "Returning cached Reward");
        return cached;
      }

      const reward = await this.rewardRepository.findById(id);
      if (!reward) {
        throw new NotFoundError("Reward", id);
      }

      const response = reward.toDTO();

      await cacheService.set(
        `reward:${id}`,
        response,
        CACHE_CONFIG.revalidate.public,
      );

      logger.info({ id }, "Successfully fetched Reward");
      return response;
    } catch (error) {
      logger.error({ error, id }, "Failed to fetch Reward by ID");
      throw error instanceof DomainError
        ? error
        : new DomainError("Failed to fetch Reward", "REWARD_FETCH_ERROR");
    }
  }

  async getRewardsByNFT(nftId: string): Promise<NFTRewardResponse[]> {
    logger.info({ nftId }, "Fetching Rewards by NFT ID");

    try {
      const cached = await cacheService.get<NFTRewardResponse[]>(
        `rewards:${nftId}`,
      );
      if (cached) {
        logger.info({ nftId }, "Returning cached Rewards");
        return cached;
      }

      const rewards = await this.rewardRepository.findByNFTId(nftId);
      if (rewards.length === 0) {
        logger.info({ nftId }, "No rewards found for NFT");
        return [];
      }

      const response = rewards.map((r) => r.toDTO());

      await cacheService.set(
        `rewards:${nftId}`,
        response,
        CACHE_CONFIG.revalidate.public,
      );

      logger.info({ nftId }, "Successfully fetched Rewards");
      return response;
    } catch (error) {
      logger.error({ error, nftId }, "Failed to fetch Rewards");
      throw error instanceof DomainError
        ? error
        : new DomainError("Failed to fetch Rewards", "REWARDS_FETCH_ERROR");
    }
  }

  async getAllRewards(): Promise<RewardResponse[]> {
    logger.info("Fetching all Rewards");

    try {
      const cached = await cacheService.get<RewardResponse[]>("all_rewards");
      if (cached) {
        logger.info("Returning cached Rewards");
        return cached;
      }

      const rewards = await this.rewardRepository.findAll();
      const response = rewards.map((r) => r.toDTO());

      await cacheService.set(
        "all_rewards",
        response,
        CACHE_CONFIG.revalidate.public,
      );

      logger.info(
        { data: { count: rewards.length } },
        "Successfully fetched all Rewards",
      );
      return response;
    } catch (error) {
      logger.error({ error }, "Failed to fetch all Rewards");
      throw error instanceof DomainError
        ? error
        : new DomainError("Failed to fetch Rewards", "REWARDS_FETCH_ERROR");
    }
  }

  async deleteReward(id: string): Promise<void> {
    logger.info({ id }, "Deleting Reward");

    try {
      const reward = await this.rewardRepository.findById(id);
      if (!reward) {
        throw new NotFoundError("Reward", id);
      }

      await this.rewardRepository.delete(id);
      await this.invalidateRewardCaches();

      logger.info({ id }, "Successfully deleted Reward");
    } catch (error) {
      logger.error({ error, id }, "Failed to delete Reward");
      throw error instanceof DomainError
        ? error
        : new DomainError("Failed to delete Reward", "REWARD_DELETE_ERROR");
    }
  }
}
