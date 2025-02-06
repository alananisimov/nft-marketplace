import type { Context, Scenes } from "telegraf";

interface BaseSceneSession extends Scenes.SceneSessionData {
  page?: number;
}

interface CollectionSceneSession extends BaseSceneSession {
  collection: {
    name: string;
    description?: string;
  };
}

interface NFTSceneSession extends BaseSceneSession {
  nftData: {
    collectionId?: string;
    assetCode?: string;
    name?: string;
    description?: string;
    image?: string;
    lockupPeriod?: number;
    domain?: string;
    code?: string;
  };
}

interface RewardSceneSession extends BaseSceneSession {
  action?: "create" | "attach";
  rewardData: {
    monthlyPercentage?: number;
    name?: string;
    symbol?: string;
    image?: string;
    issuer?: string;
    rewardId?: string;
    nftId?: string;
  };
}

interface BotSession extends Scenes.SceneSession {
  collection: Record<string, unknown>;
  nft: Record<string, unknown>;
  reward: Record<string, unknown>;
  pagination: {
    page: number;
    itemsPerPage: number;
  };
}

interface BotContext extends Context {
  session: BotSession;
  scene: Scenes.SceneContextScene<BotContext>;
}

export type {
  BotContext,
  BotSession,
  CollectionSceneSession,
  NFTSceneSession,
  RewardSceneSession,
};
