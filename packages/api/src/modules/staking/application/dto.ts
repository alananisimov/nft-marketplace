import { z } from "zod";

import { NFTResponse } from "../../nft/application/dto";
import { NFTRewardResponse } from "../../reward/application/dto";

export const CreateStakingInput = z.object({
  userId: z.string().uuid(),
  nftId: z.string().uuid(),
  nftRewardId: z.string().uuid(),
});

export type CreateStakingInput = z.infer<typeof CreateStakingInput>;

export const StakingResponse = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().optional(),
  nftId: z.string().uuid(),
  nft: NFTResponse.optional(),
  nftRewardId: z.string().uuid(),
  earned: z.number(),
  nftReward: NFTRewardResponse.optional(),
  lockupPeriod: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
});

export type StakingResponse = z.infer<typeof StakingResponse>;

export const ExtendedStakingResponse = StakingResponse.extend({
  nft: NFTResponse,
  nftReward: NFTRewardResponse,
});

export type ExtendedStakingResponse = z.infer<typeof ExtendedStakingResponse>;
