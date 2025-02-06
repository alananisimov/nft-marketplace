"use client";

import type { AuthSession } from "@acme/auth";

import { NFTCard } from "~/entities/nft/ui/nft-card";
import { useMarketData } from "../../api/market.api";
import { CollectionsGrid } from "../collections-grid";
import { MarketHeader } from "../market-header";
import { MarketHeading } from "../market-heading";
import { MarketLayout } from "../market-layout";
import { NFTCarousel } from "../nft-carousel";

export function MarketView({ session }: { session: AuthSession | null }) {
  const { nfts, collections } = useMarketData();

  return (
    <MarketLayout>
      <MarketHeader session={session} />
      {nfts.length === 1 && nfts[0] ? (
        <div className="mr-6">
          <NFTCard nft={nfts[0]} size="large" />
        </div>
      ) : (
        <NFTCarousel nfts={nfts} />
      )}

      <MarketHeading
        title="Top Collections"
        viewAllLink="/collections"
        className="pb-2 pt-6"
      />
      <CollectionsGrid collections={collections} />
    </MarketLayout>
  );
}
