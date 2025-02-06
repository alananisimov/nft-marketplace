import { atom } from "jotai";

import type { TNFT } from "~/entities/nft/model/nft.types";

export const selectedDeliveryNFTAtom = atom<TNFT>();
