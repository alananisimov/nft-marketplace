import { ScrollArea } from "@acme/ui/scroll-area";

import { Clock, Percent, TrendingUp } from "lucide-react";
import type { TNFT } from "~/entities/nft/model/nft.types";

import type { TReward } from "~/entities/reward/model/reward.types";

import { Image } from "~/shared/ui/image";

interface RewardsViewProps {
  rewards: TReward[];
  nft: TNFT;
}

export function RewardsView({ rewards, nft }: RewardsViewProps) {
  if (!rewards.length) {
    return (
      <div className="flex min-h-[150px] items-center justify-center">
        <p className="text-muted-foreground">No rewards available</p>
      </div>
    );
  }

  return (
    <ScrollArea className="min-h-[200px]">
      <div className="space-y-6 p-2">
        {/* Detailed reward information */}
        <div className="space-y-6">
          {rewards.map((reward) => (
            <RewardInfoCard key={reward.id} reward={reward} nft={nft} />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}

interface RewardInfoCardProps {
  reward: TReward;
  nft: TNFT;
}

function RewardInfoCard({ reward, nft }: RewardInfoCardProps) {
  const dailyEarning = (reward.monthlyPercentage / 31).toFixed(2);
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:bg-accent/5">
      <div className="flex flex-row justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="size-12 overflow-hidden rounded-full border border-border">
            <Image
              src={reward.reward.image}
              alt={reward.reward.name}
              width={64}
              height={64}
              className="size-12"
            />
          </div>
          <div>
            <h3 className="font-medium">{reward.reward.name}</h3>
            <p className="text-sm text-muted-foreground">
              {reward.reward.symbol}
            </p>
          </div>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground leading-tight items-start">
          *With inverstment for 100 {reward.reward.symbol}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <RewardStat
          icon={<Percent className="size-4" />}
          label="APR"
          value={`${reward.monthlyPercentage * 12}%`}
        />
        <RewardStat
          icon={<Clock className="size-4" />}
          label="Lock Period"
          value={`${nft.lockupPeriod} days`}
        />
        <RewardStat
          icon={<TrendingUp className="size-4" />}
          label="Daily reward"
          remark
          value={`${dailyEarning} ${reward.reward.symbol}`}
        />
      </div>
    </div>
  );
}

interface RewardStatProps {
  icon: React.ReactNode;
  label: string;
  remark?: boolean;
  value: string;
}
function RewardStat({ icon, label, value, remark }: RewardStatProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">
          {label}
          {remark && "*"}
        </span>
      </div>

      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
