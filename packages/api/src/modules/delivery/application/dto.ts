import { z } from "zod";

import { NFTResponse } from "../../nft/application/dto";

export const CreateDeliveryInput = z.object({
  nftId: z.string().uuid(),
  address: z.string().min(1),
  lockDate: z.number().int().positive(),
});

export type CreateDeliveryInput = z.infer<typeof CreateDeliveryInput>;

export const DeliveryResponse = z.object({
  id: z.string().uuid(),
  nftId: z.string().uuid(),
  address: z.string(),
  nft: NFTResponse.optional(),
  lockDate: z.number(),
  status: z
    .enum(["pending", "processing", "completed", "failed"])
    .default("pending"),
  ordered: z.coerce.date(),
  processed: z.coerce.date().optional(),
  estimated: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
});

export type DeliveryResponse = z.infer<typeof DeliveryResponse>;

export const DeliveryResponseWithNFT = DeliveryResponse.extend({
  nft: NFTResponse,
});

export type DeliveryResponseWithNFT = z.infer<typeof DeliveryResponseWithNFT>;
