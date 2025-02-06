import type { Scenes } from "telegraf";

import type { BotContext } from "~/types";
import { createCollectionScene, listCollectionsScene } from "./collection";
import { createNFTScene, listNFTsScene } from "./nft";
import { createRewardScene, listRewardsScene } from "./reward";

export function initializeScenes(): Scenes.BaseScene<BotContext>[] {
  return [
    createCollectionScene,
    listCollectionsScene,
    createNFTScene,
    listNFTsScene,
    createRewardScene,
    listRewardsScene,
  ];
}
