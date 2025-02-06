import { Avatar, AvatarFallback } from "@acme/ui/avatar";
import { Button } from "@acme/ui/button";

import type { TNFT } from "~/entities/nft/model/nft.types";
import { Image } from "~/shared/ui/image";
import { ActionCard } from "~/shared/ui/cards/action-card";

interface StakingConfirmProps {
  nft?: TNFT;
  onConfirm: () => void;
  onBack: () => void;
}

export function StakingConfirm({
  nft,
  onConfirm,
  onBack,
}: StakingConfirmProps) {
  return (
    <ActionCard handleBack={onBack} title="Confirm Staking">
      <div className="flex flex-col gap-y-8 p-4">
        <div className="flow-row mx-auto mt-4 flex items-center gap-x-[9px]">
          <Avatar>
            <AvatarFallback />
            <Image
              height={64}
              width={64}
              src={nft?.image ?? ""}
              alt={nft?.name ?? ""}
              className="aspect-square h-full w-full"
            />
          </Avatar>
          <div className="flex flex-col justify-between text-left">
            <span className="text-[16px] font-medium">{nft?.name}</span>
            <p className="text-muted-foreground">{nft?.description}</p>
          </div>
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
