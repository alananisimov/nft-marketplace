import { Markup } from "telegraf";

import { CONFIRMATION_BUTTONS, MAIN_MENU_BUTTONS } from "~/constants";

export const mainMenuKeyboard = Markup.keyboard([
  [MAIN_MENU_BUTTONS.CREATE_COLLECTION, MAIN_MENU_BUTTONS.LIST_COLLECTIONS],
  [MAIN_MENU_BUTTONS.CREATE_REWARD, MAIN_MENU_BUTTONS.LIST_REWARDS],
  [MAIN_MENU_BUTTONS.CREATE_NFT, MAIN_MENU_BUTTONS.LIST_NFTS],
]).resize();

export const confirmationKeyboard = Markup.inlineKeyboard([
  [
    Markup.button.callback(CONFIRMATION_BUTTONS.CONFIRM, "confirm"),
    Markup.button.callback(CONFIRMATION_BUTTONS.CANCEL, "cancel"),
  ],
]);

export const cancelKeyboard = Markup.keyboard([
  [CONFIRMATION_BUTTONS.CANCEL],
]).resize();
