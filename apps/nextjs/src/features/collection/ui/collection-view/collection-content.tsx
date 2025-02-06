import type { TCollection } from "~/entities/collection/model/collection.types";
import { NFTCard } from "~/entities/nft/ui/nft-card";

interface CollectionContentProps {
  collection: TCollection;
}

export function CollectionContent({ collection }: CollectionContentProps) {
  return (
    <div className="mt-52 flex flex-col gap-y-4 px-3 pb-3">
      <div className="grid grid-cols-2 gap-[18px]">
        {collection.nfts.map((nft) => (
          <NFTCard size="small" nft={nft} key={nft.id} />
        ))}
      </div>
    </div>
  );
}
