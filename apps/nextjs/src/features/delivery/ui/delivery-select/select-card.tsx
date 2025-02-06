import { Avatar, AvatarFallback } from "@acme/ui/avatar";

import type { TNFT } from "~/entities/nft/model/nft.types";
import { Image } from "~/shared/ui/image";
import { Icons } from "~/shared/ui/icons";
import { formatPrice } from "~/shared/utils";

interface SelectCardProps {
  item: TNFT;
  onClick: () => void;
}

export function SelectCard({ item, onClick }: SelectCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between rounded-md p-2 hover:bg-gray-200/50"
    >
      <div className="flex items-center gap-x-[9px]">
        <Avatar>
          <Image
            src={item.image}
            alt={item.name}
            height={64}
            width={64}
            className="aspect-square h-full w-full"
          />

          <AvatarFallback />
        </Avatar>
        <div className="flex flex-col justify-between text-left">
          <span className="text-[16px] font-medium">{item.name}</span>
          <p className="text-[13px] text-muted-foreground">
            {item.description}
          </p>
        </div>
      </div>

      <div className="inline-flex items-center justify-center gap-x-[5px]">
        <Icons.stellar_mono className="size-[12px]" />
        <span className="text-[16px] font-semibold">
          {formatPrice(item.currentBid)}
        </span>
      </div>
    </button>
  );
}
