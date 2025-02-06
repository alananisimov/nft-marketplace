import { Scenes } from "telegraf";
import { message } from "telegraf/filters";

import { NAVIGATION_BUTTONS } from "~/constants";
import type { BotContext } from "~/types";
import { handleCreate, handleList } from "./handlers";

export const createNFTScene = new Scenes.BaseScene<BotContext>("create_nft");
export const listNFTsScene = new Scenes.BaseScene<BotContext>("list_nfts");

createNFTScene.enter((ctx) => handleCreate.enter(ctx));
createNFTScene.hears(NAVIGATION_BUTTONS.CANCEL, (ctx) =>
  handleCreate.cancel(ctx),
);
createNFTScene.action(/^select_collection:(.+)$/, (ctx) =>
  handleCreate.handleCollectionSelect(ctx),
);
createNFTScene.on(message("text"), (ctx) => handleCreate.handleText(ctx));
createNFTScene.on(message("photo"), (ctx) => handleCreate.handlePhoto(ctx));
createNFTScene.action("confirm", (ctx) => handleCreate.confirm(ctx));
createNFTScene.action("cancel", (ctx) => handleCreate.cancel(ctx));

listNFTsScene.enter((ctx) => handleList.enter(ctx));
listNFTsScene.hears(NAVIGATION_BUTTONS.NEXT_PAGE, (ctx) =>
  handleList.nextPage(ctx),
);
listNFTsScene.hears(NAVIGATION_BUTTONS.PREV_PAGE, (ctx) =>
  handleList.prevPage(ctx),
);
listNFTsScene.hears(NAVIGATION_BUTTONS.MAIN_MENU, (ctx) =>
  handleList.mainMenu(ctx),
);
