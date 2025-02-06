"use client";

import { api } from "~/app/providers/trpc-provider/react";

export function useNFTData({ nftId }: { nftId: string }) {
  const [nft] = api.nft.byId.useSuspenseQuery({
    id: nftId,
  });
  const [rewards] = api.rewards.byNFTId.useSuspenseQuery({
    id: nftId,
  });

  return {
    nft: nft,
    rewards: rewards,
  };
}
