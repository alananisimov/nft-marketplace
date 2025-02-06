import { atom } from "jotai";

export const loginState = atom<
  | {
      stellarKey: string;
      password: string;
    }
  | undefined
>(undefined);
