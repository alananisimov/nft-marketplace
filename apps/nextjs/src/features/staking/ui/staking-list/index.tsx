import { Button } from "@acme/ui/button";

import type { TStakingItem } from "../../model/staking.types";
import { StakingCard } from "./staking-card";
import type { TNFT } from "~/entities/nft/model/nft.types";

interface StakingListProps {
  items: TStakingItem[];
  availableNFTs: TNFT[];
  onSelectNew: () => void;
}

export function StakingList({
  items,
  onSelectNew,
  availableNFTs,
}: StakingListProps) {
  return (
    <div className="flex flex-col">
      {availableNFTs.length > 0 && (
        <Button
          variant="light"
          size="light"
          onClick={onSelectNew}
          className="w-full"
        >
          Select NFT for Staking
        </Button>
      )}

      <div className="flex flex-col gap-y-2 pt-[14px]">
        {items.map((item) => (
          <StakingCard key={item.id} item={item} />
        ))}

        {items.length === 0 && (
          <p className="text-[14px] font-medium text-gray-500">
            You don't have any stakes
          </p>
        )}
      </div>
    </div>
  );
}
