import "reflect-metadata";

import { inject, injectable } from "tsyringe";

import type { RewardRepository } from "../../reward/infrastructure/reward.repository";
import type { StakingRepository } from "../infrastructure/staking.repository";
import type {
  CreateStakingInput,
  ExtendedStakingResponse,
  StakingResponse,
} from "./dto";
import { CACHE_CONFIG } from "../../../constants";
import { DomainError, NotFoundError } from "../../../shared/domain/errors";
import { cacheService } from "../../../shared/infrastructure/cache";
import { calculateEarnedPercent } from "../../../utils";
import { logger } from "../../../utils/logger";
import { StakingEntity } from "../domain/staking.entity";
import { NFTRepository } from "../../nft/infrastructure/nft.repository";

@injectable()
export class StakingService {
  constructor(
    @inject("StakingRepository")
    private readonly stakingRepository: StakingRepository,
    @inject("RewardRepository")
    private readonly rewardRepository: RewardRepository,
    @inject("NFTRepository")
    private readonly nftRepository: NFTRepository,
  ) {}

  async createStaking(input: CreateStakingInput): Promise<StakingResponse> {
    logger.info({ input }, "Creating new staking");

    try {
      const rewardExists = await this.rewardRepository.exists(
        input.nftRewardId,
      );
      if (!rewardExists) {
        throw new NotFoundError("Reward", input.nftRewardId);
      }

      const nft = await this.nftRepository.findById(input.nftId);
      if (!nft) {
        throw new NotFoundError("NFT", input.nftId);
      }

      const now = new Date();
      const lockupDate = new Date(now);
      lockupDate.setDate(lockupDate.getDate() + nft.lockupPeriod);

      const staking = StakingEntity.create({
        ...input,
        earned: 0,
        lockupPeriod: lockupDate,
      });
      const savedStaking = await this.stakingRepository.create(staking);

      await cacheService.del(`staking:${input.nftId}`);
      await cacheService.del(`user_stakings:${input.userId}`);
      await cacheService.del(`available_nfts:${input.userId}`);

      logger.info({ id: savedStaking.id }, "Successfully created staking");
      return savedStaking.toDTO();
    } catch (error) {
      logger.error({ error, input }, "Failed to create staking");
      throw error instanceof DomainError
        ? error
        : new DomainError("Failed to create staking", "STAKING_CREATE_ERROR");
    }
  }

  async getStakingByNftId(nftId: string): Promise<StakingResponse> {
    logger.info({ nftId }, "Fetching staking by NFT ID");

    try {
      const cached = await cacheService.get<StakingResponse>(
        `staking:${nftId}`,
      );
      if (cached) {
        logger.info({ nftId }, "Returning cached staking");
        return cached;
      }

      const staking = await this.stakingRepository.findByNftId(nftId);
      if (!staking) {
        throw new NotFoundError("Staking", nftId);
      }

      const response = staking.toExtendedDTO();

      await cacheService.set(
        `staking:${nftId}`,
        response,
        CACHE_CONFIG.revalidate.protected,
      );

      logger.info({ nftId }, "Successfully fetched staking");
      return response;
    } catch (error) {
      logger.error({ error, nftId }, "Failed to fetch staking");
      throw error instanceof DomainError
        ? error
        : new DomainError("Failed to fetch staking", "STAKING_FETCH_ERROR");
    }
  }

  async updateEarnedForAllStakings(): Promise<void> {
    logger.info("Starting earned update for all stakings");

    try {
      const stakings = await this.stakingRepository.findAll();

      const stakingsDtos = stakings.map((staking) => staking.toExtendedDTO());

      for (const staking of stakingsDtos) {
        const earned = calculateEarnedPercent({
          lockupPeriod: staking.lockupPeriod,
          monthlyPercentage: staking.nftReward.monthlyPercentage,
        });

        await this.stakingRepository.update(staking.id, {
          earned: earned,
        });

        await cacheService.del(`staking:${staking.nftId}`);
        await cacheService.del(`user_stakings:${staking.userId}`);

        logger.debug(
          {
            stakingId: staking.id,
            nftId: staking.nftId,
            earned,
            monthlyPercentage: staking.nftReward.monthlyPercentage,
            lockupPeriod: staking.lockupPeriod,
          },
          "Updated staking earned value",
        );
      }

      logger.info(
        { count: stakings.length },
        "Successfully updated earned for all stakings",
      );
    } catch (error) {
      logger.error({ error }, "Failed to update earned for stakings");
      throw error instanceof DomainError
        ? error
        : new DomainError("Failed to update earned", "STAKING_UPDATE_ERROR");
    }
  }

  async getUserStakings(userId: string): Promise<ExtendedStakingResponse[]> {
    logger.info({ userId }, "Fetching user stakings");

    try {
      const cached = await cacheService.get<ExtendedStakingResponse[]>(
        `user_stakings:${userId}`,
      );
      if (cached) {
        logger.info({ userId }, "Returning cached user stakings");
        return cached;
      }

      const stakings = await this.stakingRepository.findByUser(userId);
      const responses = stakings.map((staking) => staking.toExtendedDTO());

      await cacheService.set(
        `user_stakings:${userId}`,
        responses,
        CACHE_CONFIG.revalidate.protected,
      );

      logger.info(
        { userId, count: responses.length },
        "Successfully fetched user stakings",
      );

      return responses;
    } catch (error) {
      logger.error({ error, userId }, "Failed to fetch user stakings");
      throw error instanceof DomainError
        ? error
        : new DomainError(
            "Failed to fetch user stakings",
            "STAKINGS_FETCH_ERROR",
          );
    }
  }
}
