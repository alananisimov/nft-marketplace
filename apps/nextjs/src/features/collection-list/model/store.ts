import { atom } from "jotai";

import type { SortConfig } from "./types";

export const collectionsSortAtom = atom<SortConfig>({
  key: "createdAt",
  order: "desc",
});
