"use client";

import { useNFTData } from "../../api/nft.api";
import { NFTInfo } from "../nft-info";
import { NFTBidSection } from "./nft-bid-section";
import { NFTDescription } from "./nft-description";
import { NFTHeader } from "./nft-header";
import { NFTImage } from "./nft-image";

interface NFTViewProps {
  nftId: string;
}
export function NFTView({ nftId }: NFTViewProps) {
  const { nft, rewards } = useNFTData({
    nftId: nftId,
  });
  return (
    <>
      <NFTHeader nft={nft} />
      <div className="flex flex-col gap-y-4">
        <div className={"flex flex-col gap-y-6"}>
          <div className="flex flex-col gap-y-4">
            <NFTImage nft={nft} />
            <NFTBidSection nft={nft} />
          </div>
          <NFTDescription nft={nft} />
        </div>
        <NFTInfo rewards={rewards} nft={nft} />
      </div>
    </>
  );
}
