import { useRouter } from "next/navigation";

import { cn } from "@acme/ui";
import { Carousel, CarouselContent, CarouselItem } from "@acme/ui/carousel";

import type { TNFT } from "~/entities/nft/model/nft.types";
import { NFTCard } from "~/entities/nft/ui/nft-card";
import { dmSans } from "~/fonts/dm-sans";

interface NFTCarouselProps {
  nfts: TNFT[];
  maxItems?: number;
}

export function NFTCarousel({ nfts, maxItems = 4 }: NFTCarouselProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-y-3 overflow-visible">
      <h2 className={cn(dmSans.className, "text-[24px] font-bold")}>All NFT</h2>
      <Carousel className="w-full">
        <CarouselContent>
          {nfts.slice(0, maxItems).map((nft, index) => (
            <CarouselItem key={index} className="basis-[70%] pb-5">
              <NFTCard
                nft={nft}
                size="medium"
                onImageClick={() => router.push(`/nft/${nft.id}`)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
