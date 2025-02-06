import { z } from "zod";

export const CreateRewardInput = z.object({
  image: z.string(),
  name: z.string(),
  symbol: z.string(),
  issuer: z.string(),
});

export type CreateRewardInput = z.infer<typeof CreateRewardInput>;

export const CreateNFTRewardInput = z.object({
  nftId: z.string().uuid(),
  rewardId: z.string().uuid(),
  monthlyPercentage: z.number().min(0).max(100),
});

export type CreateNFTRewardInput = z.infer<typeof CreateNFTRewardInput>;

export const RewardResponse = z.object({
  id: z.string().uuid(),
  name: z.string(),
  image: z.string(),
  issuer: z.string(),
  symbol: z.string(),
  createdAt: z.coerce.date(),
});

export type RewardResponse = z.infer<typeof RewardResponse>;

export const NFTRewardResponse = z.object({
  id: z.string().uuid(),
  nftId: z.string().uuid(),
  rewardId: z.string().uuid(),
  monthlyPercentage: z.number(),
  reward: RewardResponse,
  createdAt: z.coerce.date(),
});

export type NFTRewardResponse = z.infer<typeof NFTRewardResponse>;
