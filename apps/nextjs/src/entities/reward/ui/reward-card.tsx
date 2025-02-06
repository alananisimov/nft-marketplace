import type { ComponentProps } from "react";

import { cn } from "@acme/ui";

import type { TReward } from "../model/reward.types";
import { Image } from "~/shared/ui/image";

interface RewardCardProps extends ComponentProps<"button"> {
  reward: TReward;
}

export function RewardCard({ reward, ...props }: RewardCardProps) {
  return (
    <button
      {...props}
      className={cn("flex flex-row items-center gap-y-[6px]", props.className)}
    >
      <Image
        src={reward.reward.image}
        alt={reward.reward.name}
        width={64}
        height={64}
        className="size-14 object-contain"
      />
      <span className="text-[14px] font-medium">{reward.reward.symbol}</span>
    </button>
  );
}
