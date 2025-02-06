import type { ComponentProps } from "react";

import { cn } from "@acme/ui";
import { Avatar, AvatarFallback } from "@acme/ui/avatar";

import type { TNFT } from "~/entities/nft/model/nft.types";
import { Icons } from "~/shared/ui/icons";
import { formatPrice } from "~/shared/utils";

import { Image } from "~/shared/ui/image";

interface StakingSelectCardProps extends ComponentProps<"button"> {
  item: TNFT;
}

export function StakingSelectCard({ item, ...props }: StakingSelectCardProps) {
  return (
    <button
      className={cn(
        "flex w-full flex-row items-center justify-between rounded-md p-2 transition-colors hover:bg-gray-100",
      )}
      {...props}
    >
      <div className="flow-row flex items-center gap-x-[9px]">
        <Avatar>
          <AvatarFallback />
          <Image
            height={64}
            width={64}
            src={item.image}
            alt={item.name}
            className="aspect-square h-full w-full"
          />
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
