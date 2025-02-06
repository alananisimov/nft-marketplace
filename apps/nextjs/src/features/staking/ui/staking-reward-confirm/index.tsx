import { Avatar, AvatarFallback } from "@acme/ui/avatar";
import { Button } from "@acme/ui/button";

import type { TReward } from "~/entities/reward/model/reward.types";
import { Image } from "~/shared/ui/image";
import { ActionCard } from "~/shared/ui/cards/action-card";

interface StakingRewardConfirmProps {
  reward?: TReward;
  onConfirm: () => void;
  onBack: () => void;
}

export function StakingRewardConfirm({
  reward,
  onConfirm,
  onBack,
}: StakingRewardConfirmProps) {
  return (
    <ActionCard handleBack={onBack} title="Confirm Reward Asset">
      <div className="flex flex-col gap-y-8 p-4">
        <div className="flow-row mx-auto mt-4 flex items-center gap-x-[6px]">
          <Avatar className="size-14">
            <AvatarFallback />
            <Image
              height={64}
              width={64}
              src={reward?.reward.image ?? ""}
              alt={reward?.reward.name ?? ""}
              className="aspect-square h-full w-full"
            />
          </Avatar>
          <span className="text-[14px] font-medium">{reward?.reward.name}</span>
        </div>
        <Button
          size="light"
          variant="light"
          className="w-full"
          onClick={onConfirm}
        >
          Confirm
        </Button>
      </div>
    </ActionCard>
  );
}
