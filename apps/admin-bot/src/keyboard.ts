import { Markup } from "telegraf";
import { MAIN_MENU_BUTTONS, CONFIRMATION_BUTTONS } from "~/constants";

export const mainMenuKeyboard = Markup.keyboard([
  [MAIN_MENU_BUTTONS.CREATE_COLLECTION, MAIN_MENU_BUTTONS.LIST_COLLECTIONS],
  [MAIN_MENU_BUTTONS.CREATE_REWARD, MAIN_MENU_BUTTONS.LIST_REWARDS],
  [MAIN_MENU_BUTTONS.CREATE_NFT, MAIN_MENU_BUTTONS.LIST_NFTS],
]).resize();

export const confirmationKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: CONFIRMATION_BUTTONS.CONFIRM, callback_data: "confirm" },
        { text: CONFIRMATION_BUTTONS.CANCEL, callback_data: "cancel" },
      ],
    ],
  },
};

export const cancelKeyboard = Markup.keyboard([
  [CONFIRMATION_BUTTONS.CANCEL],
]).resize();

export function createInlineKeyboard(
  buttons: { text: string; callback_data: string }[][],
) {
  return {
    reply_markup: {
      inline_keyboard: buttons,
    },
  };
}

export function createReplyKeyboard(buttons: string[][]) {
  return Markup.keyboard(buttons).resize();
}
