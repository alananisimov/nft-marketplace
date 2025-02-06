import { Button } from "@acme/ui/button";

import type { TDeliveryItem } from "../../model/delivery.types";
import { DeliveryCard } from "./delivery-card";
import type { TNFT } from "~/entities/nft/model/nft.types";

interface DeliveryListProps {
  items: TDeliveryItem[];
  availableItems: TNFT[];
  onSelectNew: () => void;
}

export function DeliveryList({
  items,
  onSelectNew,
  availableItems,
}: DeliveryListProps) {
  return (
    <div className="flex flex-col">
      {availableItems.length > 0 && (
        <Button
          variant="light"
          size="light"
          onClick={onSelectNew}
          className="w-full"
        >
          Select NFT for delivery
        </Button>
      )}

      <div className="flex flex-col gap-y-4 pt-[14px]">
        {items.map((item) => (
          <DeliveryCard key={item.id} item={item} />
        ))}

        {items.length === 0 && (
          <p className="text-[14px] font-medium text-gray-500">
            You don't have any NFT for delivery
          </p>
        )}
      </div>
    </div>
  );
}
