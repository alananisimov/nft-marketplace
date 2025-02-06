import { api } from "~/app/providers/trpc-provider/react";

export function useMarketData() {
  const [nfts] = api.nft.all.useSuspenseQuery();
  const [collections] = api.collection.all.useSuspenseQuery();

  return {
    nfts: nfts,
    collections: collections,
  };
}
