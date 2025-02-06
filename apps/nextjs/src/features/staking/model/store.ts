import { EOF } from "dns/promises";
import { atom } from "jotai";

import type { TNFT } from "~/entities/nft/model/nft.types";

export const selectedStakingNFTAtom = atom<TNFT | undefined>(undefined);

export const rewardsDrawerOpenAtom = atom(false);
