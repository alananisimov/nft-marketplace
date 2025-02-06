import type { TNFT } from "~/entities/nft/model/nft.types";
import { ActionCard } from "~/shared/ui/cards/action-card";
import { StakingSelectCard } from "./select-card";

interface StakingSelectProps {
  items: TNFT[];
  onSelect: (nft: TNFT) => void;
  onBack: () => void;
}

export function StakingSelect({ items, onSelect, onBack }: StakingSelectProps) {
  return (
    <ActionCard handleBack={onBack} title="Select NFT for Staking">
      <div className="flex flex-col p-[14px]">
        {items.map((item) => (
          <StakingSelectCard
            key={item.id}
            item={item}
            onClick={() => onSelect(item)}
          />
        ))}
      </div>
    </ActionCard>
  );
}
