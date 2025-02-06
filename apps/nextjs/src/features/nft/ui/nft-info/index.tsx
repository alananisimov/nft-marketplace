"use client";

import type { ComponentProps } from "react";

import { H1 } from "@acme/ui/typography";

import type { TNFT } from "~/entities/nft/model/nft.types";
import type { TReward } from "~/entities/reward/model/reward.types";
import { cn } from "~/shared/utils";
import { NFTInfoDetails } from "./nft-info-details";

interface NFTInfoProps extends ComponentProps<"div"> {
  nft: TNFT;
  rewards: TReward[];
}

export function NFTInfo({ nft, rewards, ...props }: NFTInfoProps) {
  return (
    <div {...props} className={cn("flex flex-col gap-y-4", props.className)}>
      <H1>Info</H1>
      <NFTInfoDetails nft={nft} rewards={rewards} />
    </div>
  );
}
