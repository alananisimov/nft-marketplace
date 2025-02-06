import { z } from "zod";

export const CreateNFTInput = z.object({
  assetCode: z.string().min(1).max(12),
  name: z.string().min(1).max(255),
  description: z.string(),
  image: z.string(),
  lockupPeriod: z.number().positive(),
  domain: z.string(),
  code: z.string(),
  collectionId: z.string().uuid(),
});

export type CreateNFTInput = z.infer<typeof CreateNFTInput>;

export const NFTResponse = z.object({
  id: z.string().uuid(),
  assetCode: z.string(),
  name: z.string(),
  description: z.string(),
  image: z.string(),
  lockupPeriod: z.number(),
  issuerPubkey: z.string(),
  domain: z.string(),
  code: z.string(),
  collectionId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
});

export type NFTResponse = z.infer<typeof NFTResponse>;

export const NFTResponseWithMarketData = NFTResponse.extend({
  marketLink: z.string(),
  priceChange: z.number(),
  currentBid: z.number(),
});

export type NFTResponseWithMarketData = z.infer<
  typeof NFTResponseWithMarketData
>;

export const UploadNFTImageInput = z.object({
  file: z.custom<Buffer>(),
  filename: z.string().min(1),
  mimetype: z.string().min(1),
});

export type UploadNFTImageInput = z.infer<typeof UploadNFTImageInput>;
