import { Scenes } from "telegraf";
import { message } from "telegraf/filters";

import { NAVIGATION_BUTTONS } from "~/constants";
import type { BotContext } from "~/types";
import { handleCreate, handleList } from "./handlers";

export const createCollectionScene = new Scenes.BaseScene<BotContext>(
  "create_collection",
);
export const listCollectionsScene = new Scenes.BaseScene<BotContext>(
  "list_collections",
);

createCollectionScene.enter((ctx) => handleCreate.enter(ctx));
createCollectionScene.hears(NAVIGATION_BUTTONS.CANCEL, (ctx) =>
  handleCreate.cancel(ctx),
);
createCollectionScene.on(message("text"), (ctx) =>
  handleCreate.handleText(ctx),
);
createCollectionScene.action("confirm", (ctx) => handleCreate.confirm(ctx));
createCollectionScene.action("cancel", (ctx) => handleCreate.cancel(ctx));

listCollectionsScene.enter((ctx) => handleList.enter(ctx));
listCollectionsScene.hears(NAVIGATION_BUTTONS.NEXT_PAGE, (ctx) =>
  handleList.nextPage(ctx),
);
listCollectionsScene.hears(NAVIGATION_BUTTONS.PREV_PAGE, (ctx) =>
  handleList.prevPage(ctx),
);
listCollectionsScene.hears(NAVIGATION_BUTTONS.MAIN_MENU, (ctx) =>
  handleList.mainMenu(ctx),
);
