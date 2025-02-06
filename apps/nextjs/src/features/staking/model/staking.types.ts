import type { z } from "zod";

import type { StakingItemSchema } from "./staking.schema";
import type { TNFT } from "~/entities/nft/model/nft.types";
import type { TReward } from "~/entities/reward/model/reward.types";

export type TStakingItem = z.infer<typeof StakingItemSchema>;

export interface StakingState {
  stage: StakingStage;
  isLoading: boolean;
  selectedNFT?: TNFT;
  selectedReward?: TReward;
  error?: string;
}

export enum StakingStage {
  LIST = "LIST",
  SELECT = "SELECT",
  CONFIRM = "CONFIRM",
  REWARD_SELECT = "REWARD_SELECT",
  REWARD_CONFIRM = "REWARD_CONFIRM",
  ORDER_CONFIRM = "ORDER_CONFIRM",
  SUCCESS = "SUCCESS",
}
