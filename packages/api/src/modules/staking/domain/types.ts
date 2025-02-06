import type { NFT, NFTReward, Reward, StakingItem } from "@acme/db/schema";

import type { BaseEntity } from "../../../shared/domain/types";
import type { NFTResponse } from "../../nft/application/dto";
import type { NFTRewardResponse } from "../../reward/application/dto";

export interface StakingProps extends BaseEntity {
  nftId: string;
  nft?: NFTResponse;
  userId: string;
  earned: number;
  nftRewardId: string;
  nftReward?: NFTRewardResponse;
  lockupPeriod: Date;
}

export type StakingFromDB = typeof StakingItem.$inferSelect & {
  nft: typeof NFT.$inferSelect;
  nftReward: typeof NFTReward.$inferSelect & {
    reward: typeof Reward.$inferSelect;
  };
};
