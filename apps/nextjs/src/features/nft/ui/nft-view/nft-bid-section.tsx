import type { TNFT } from "~/entities/nft/model/nft.types";
import { Icons } from "~/shared/ui/icons";
import { formatPrice } from "~/shared/utils";
import { PlaceBidButton } from "./place-bid-button";

interface NFTBidSectionProps {
  nft: TNFT;
}

export function NFTBidSection({ nft }: NFTBidSectionProps) {
  return (
    <div className="flex flex-row items-center justify-between">
      <div className="flex flex-col gap-y-1">
        <h4 className="text-[22px]">Highest Bid</h4>
        <span className="flex flex-row items-center gap-x-2">
          <b className="text-[22px]">{formatPrice(nft.currentBid)}</b>
          <Icons.stellar_mono className="size-5" />
        </span>
      </div>
      <PlaceBidButton marketLink={nft.marketLink} />
    </div>
  );
}
