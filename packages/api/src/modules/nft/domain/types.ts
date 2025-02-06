import type { BaseEntity } from "../../../shared/domain/types";

export interface NFTProps extends BaseEntity {
  assetCode: string;
  name: string;
  description: string;
  image: string;
  lockupPeriod: number;
  domain: string;
  code: string;
  issuerPubkey: string;
  issuerPrivatekey: string;
  distribPubkey: string;
  distribPrivatekey: string;
  collectionId: string;
  marketData?: {
    currentBid: number;
    priceChange: number;
    marketLink: string;
  };
}

export interface MarketData {
  currentBid: number;
  priceChange: number;
  marketLink: string;
}

export type NFTWithMarketData = NFTProps & MarketData;
