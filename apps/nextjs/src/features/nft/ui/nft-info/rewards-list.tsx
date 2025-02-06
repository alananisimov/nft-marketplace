import type { TReward } from "~/entities/reward/model/reward.types";

interface RewardsListProps {
  nftRewards: TReward[];
}

export function RewardsList({ nftRewards }: RewardsListProps) {
  return (
    <>
      {nftRewards.map((reward, i) => (
        <span key={i} className="flex flex-row justify-between">
          <p>{reward.reward.symbol} rewards</p>
          <p>{reward.monthlyPercentage} % daily</p>
        </span>
      ))}
    </>
  );
}
