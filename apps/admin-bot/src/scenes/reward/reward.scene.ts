import { Scenes } from "telegraf";
import { message } from "telegraf/filters";

import type { BotContext } from "~/types";
import { NAVIGATION_BUTTONS } from "~/constants";
import { handleCreate, handleList } from "./handlers";

export const createRewardScene = new Scenes.BaseScene<BotContext>(
  "create_reward",
);
export const listRewardsScene = new Scenes.BaseScene<BotContext>(
  "list_rewards",
);

createRewardScene.enter((ctx) => handleCreate.enter(ctx));
createRewardScene.hears(NAVIGATION_BUTTONS.CANCEL, (ctx) =>
  handleCreate.cancel(ctx),
);

createRewardScene.action("create_new", (ctx) =>
  handleCreate.handleCreateNew(ctx),
);
createRewardScene.action("attach_existing", (ctx) =>
  handleCreate.handleAttachExisting(ctx),
);
createRewardScene.action(/^select_reward:(.+)$/, (ctx) =>
  handleCreate.handleRewardSelect(ctx),
);

createRewardScene.action(/^select_nft:(.+)$/, (ctx) =>
  handleCreate.handleNFTSelect(ctx),
);

createRewardScene.on(message("text"), async (ctx) => {
  const text = ctx.message.text;
  if (text === NAVIGATION_BUTTONS.CANCEL) {
    return handleCreate.cancel(ctx);
  }
  return handleCreate.handleText(ctx);
});
createRewardScene.on(message("photo"), (ctx) => handleCreate.handlePhoto(ctx));
createRewardScene.action("confirm", (ctx) => handleCreate.confirm(ctx));
createRewardScene.action("cancel", (ctx) => handleCreate.cancel(ctx));

// List Rewards Scene setup
listRewardsScene.enter((ctx) => handleList.enter(ctx));
listRewardsScene.hears(NAVIGATION_BUTTONS.NEXT_PAGE, (ctx) =>
  handleList.nextPage(ctx),
);
listRewardsScene.hears(NAVIGATION_BUTTONS.PREV_PAGE, (ctx) =>
  handleList.prevPage(ctx),
);
listRewardsScene.hears(NAVIGATION_BUTTONS.MAIN_MENU, (ctx) =>
  handleList.mainMenu(ctx),
);
