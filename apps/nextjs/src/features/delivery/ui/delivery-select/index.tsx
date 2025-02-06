import type { TNFT } from "~/entities/nft/model/nft.types";
import { ActionCard } from "~/shared/ui/cards/action-card";
import { SelectCard } from "./select-card";

interface DeliverySelectProps {
  items: TNFT[];
  onSelect: (nft: TNFT) => void;
  onBack: () => void;
}

export function DeliverySelect({
  items,
  onSelect,
  onBack,
}: DeliverySelectProps) {
  return (
    <ActionCard handleBack={onBack} title="Select NFT for Delivery">
      <div className="flex flex-col p-[14px]">
        {items.map((item) => (
          <SelectCard
            key={item.id}
            item={item}
            onClick={() => onSelect(item)}
          />
        ))}
      </div>
    </ActionCard>
  );
}
