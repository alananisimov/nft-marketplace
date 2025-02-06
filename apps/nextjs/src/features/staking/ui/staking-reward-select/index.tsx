import { Avatar, AvatarFallback } from "@acme/ui/avatar";
import { Button } from "@acme/ui/button";
import { Info } from "lucide-react";

import type { TReward } from "~/entities/reward/model/reward.types";
import { Image } from "~/shared/ui/image";
import { ActionCard } from "~/shared/ui/cards/action-card";

import { useAtom } from "jotai";
import { rewardsDrawerOpenAtom } from "../../model/store";
import dynamic from "next/dynamic";

const RewardsDrawer = dynamic(
  () => import("../staking-rewards/rewards-drawer"),
  { ssr: false },
);

interface StakingRewardSelectProps {
  rewards: TReward[];
  nftId?: string;
  onSelect: (reward: TReward) => void;
  onBack: () => void;
}

export function StakingRewardSelect({
  rewards,
  onSelect,
  nftId,
  onBack,
}: StakingRewardSelectProps) {
  const [, setOpen] = useAtom(rewardsDrawerOpenAtom);
  return (
    <ActionCard
      handleBack={onBack}
      title="Select Reward Asset"
      leftButton={
        <Button
          variant={"ghost"}
          size={"icon"}
          onClick={() => setOpen((v) => !v)}
        >
          <Info className="size-4 text-muted-foreground" />
        </Button>
      }
    >
      <RewardsDrawer nftId={nftId ?? ""} />
      <div className="flex flex-wrap p-[14px] gap-2">
        {rewards.length == 0 && (
          <p className="text-muted-foreground text-sm">No rewards found.</p>
        )}
        {rewards.map((reward) => (
          <button
            key={reward.id}
            className="flex items-center gap-x-3 rounded-md p-2 hover:bg-gray-100 w-fit"
            onClick={() => onSelect(reward)}
          >
            <Avatar className="size-10">
              <AvatarFallback />
              <Image
                height={64}
                width={64}
                src={reward.reward.image}
                alt={reward.reward.name}
                className="aspect-square h-full w-full"
              />
            </Avatar>
            <span className="text-[14px] font-medium">
              {reward.reward.symbol}
            </span>
          </button>
        ))}
      </div>
    </ActionCard>
  );
}
