import { z } from "zod";

import { NFTResponseWithMarketData } from "../../nft/application/dto";

export const CreateCollectionInput = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1).max(1024),
});

export type CreateCollectionInput = z.infer<typeof CreateCollectionInput>;

export const CollectionResponse = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  image: z.string(),
  price: z.number(),
  priceChange: z.number(),
  nfts: z.array(NFTResponseWithMarketData),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
});

export type CollectionResponse = z.infer<typeof CollectionResponse>;
