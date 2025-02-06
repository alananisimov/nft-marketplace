import { Skeleton } from "@acme/ui/skeleton";

import { NFTCardSkeleton } from "~/entities/nft/ui/nft-card";

export function NFTCarouselSkeleton() {
  return (
    <div className="flex flex-col gap-y-3">
      <Skeleton className="h-8 w-32" />
      <div className="flex gap-x-4 overflow-hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <NFTCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
