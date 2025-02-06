import type { NFTReward, Reward } from "@acme/db/schema";

import type { BaseEntity } from "../../../shared/domain/types";
import type { RewardEntity } from "./reward.entity";

export interface RewardProps extends BaseEntity {
  name: string;
  image: string;
  issuer: string;
  symbol: string;
}

export interface NFTRewardProps extends BaseEntity {
  nftId: string;
  rewardId: string;
  monthlyPercentage: number;
  reward?: RewardEntity;
}

export type RewardFromDB = typeof Reward.$inferSelect;
export type NFTRewardFromDB = typeof NFTReward.$inferSelect & {
  reward: RewardFromDB;
};
