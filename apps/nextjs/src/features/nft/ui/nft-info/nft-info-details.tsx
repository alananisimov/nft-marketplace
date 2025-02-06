import type { TNFT } from "~/entities/nft/model/nft.types";
import type { TReward } from "~/entities/reward/model/reward.types";
import { LockupPeriod } from "./lockup-period";
import { RewardsList } from "./rewards-list";

interface NFTInfoDetailsProps {
  nft: TNFT;
  rewards: TReward[];
}

export function NFTInfoDetails({ nft, rewards }: NFTInfoDetailsProps) {
  return (
    <div className="flex flex-col gap-y-1">
      <LockupPeriod lockupPeriod={nft.lockupPeriod} />
      <RewardsList nftRewards={rewards} />
    </div>
  );
}
