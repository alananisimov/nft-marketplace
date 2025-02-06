import type { TNFT } from "~/entities/nft/model/nft.types";
import { Image } from "~/shared/ui/image";
import { ActionCard } from "~/shared/ui/cards/action-card";

interface StakingSuccessProps {
  nft?: TNFT;
  onBack: () => void;
}

export function StakingSuccess({ nft, onBack }: StakingSuccessProps) {
  return (
    <ActionCard handleBack={onBack} title="Staking">
      <div className="flex flex-row items-center justify-center gap-x-[10px] pb-[28px] pt-[14px]">
        <Image
          src={nft?.image ?? "/avatar.png"}
          alt=""
          width={64}
          height={64}
          className="size-12 rounded-full"
        />
        <h4 className="text-[14px] font-semibold text-[#007AFF]">
          Your stake is confirmed
        </h4>
      </div>
    </ActionCard>
  );
}
