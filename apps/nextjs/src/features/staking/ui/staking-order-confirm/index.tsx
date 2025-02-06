import { useState } from "react";

import { Avatar, AvatarFallback } from "@acme/ui/avatar";
import { Button } from "@acme/ui/button";
import { Checkbox } from "@acme/ui/checkbox";

import type { TNFT } from "~/entities/nft/model/nft.types";
import type { TReward } from "~/entities/reward/model/reward.types";
import { Image } from "~/shared/ui/image";
import { ActionCard } from "~/shared/ui/cards/action-card";
import { Icons } from "~/shared/ui/icons";

interface StakingOrderConfirmProps {
  nft?: TNFT;
  reward?: TReward;
  onConfirm: () => void;
  onBack: () => void;
}

export function StakingOrderConfirm({
  nft,
  reward,
  onConfirm,
  onBack,
}: StakingOrderConfirmProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState<string | undefined>();
  if (!reward || !nft) {
    return null;
  }

  const handleConfirm = () => {
    if (!isChecked) {
      setError("You must accept the staking terms");
      return;
    }
    setError(undefined);
    onConfirm();
  };

  return (
    <ActionCard handleBack={onBack} title="Confirm Staking Order">
      <div className="flex flex-col gap-y-8 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">NFT</span>
          <div className="flex items-center gap-x-2">
            <Avatar>
              <AvatarFallback />
              <Image
                height={64}
                width={64}
                src={nft.image}
                alt={nft.name}
                className="aspect-square h-full w-full"
              />
            </Avatar>
            <div className="flex flex-col justify-between text-left">
              <span className="text-[12px] font-medium">{nft.name}</span>
              <p className="text-xs text-muted-foreground truncate max-w-3">
                {nft.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Reward Asset</span>
          <div className="flex items-center gap-x-2">
            <Avatar className="size-8">
              <AvatarFallback />
              <Image
                height={64}
                width={64}
                src={reward.reward.image}
                alt={nft.name}
                className="aspect-square h-full w-full"
              />
            </Avatar>
            <span className="text-sm font-medium">{reward.reward.symbol}</span>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex flex-col gap-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Lock-up Period</span>
              <span className="text-sm font-medium">
                {nft.lockupPeriod} days
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">APY</span>
              <div className="flex items-center gap-x-1">
                <Icons.stellar_mono className="size-4" />
                <span className="text-sm font-medium">
                  {reward.monthlyPercentage * 12}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={isChecked}
              onCheckedChange={() => {
                setIsChecked((v) => !v);
                setError(undefined);
              }}
            />
            <label
              htmlFor="terms"
              className="text-[9px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I understand that my NFT will be locked for {nft.lockupPeriod}{" "}
              days
            </label>
          </div>

          {error && (
            <span className="text-[9px] text-destructive">{error}</span>
          )}
        </div>

        <Button
          size="light"
          variant="light"
          className="w-full"
          onClick={handleConfirm}
        >
          Confirm Staking
        </Button>
      </div>
    </ActionCard>
  );
}
