"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import { Avatar, AvatarFallback } from "@acme/ui/avatar";
import { Button } from "@acme/ui/button";

import type { TStakingItem } from "../../model/staking.types";
import { Image } from "~/shared/ui/image";
import { Icons } from "~/shared/ui/icons";
import { formatDate, formatPrice } from "~/shared/utils";

interface StakingCardProps {
  item: TStakingItem;
}

export function StakingCard({ item }: StakingCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const now = new Date();

  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div
        className="flex items-center justify-between p-4"
        onClick={() => setShowDetails((v) => !v)}
      >
        <div className="flex items-center gap-x-3">
          <Avatar>
            <AvatarFallback />
            <Image
              src={item.nft.image}
              alt={item.nft.name}
              width={64}
              height={64}
              className="rounded-md object-cover"
            />
          </Avatar>
          <div>
            <h4 className="text-[16px] font-medium">{item.nft.name}</h4>
            {now < new Date(item.lockupPeriod) && (
              <p className="text-[13px] text-gray-500">
                Locked-up until {formatDate(item.lockupPeriod)}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-x-5">
          <Stat label="Last 24h" value={formatPrice(item.earned)} />
          <Stat label="All time" value={formatPrice(item.earned)} />
        </div>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <StakingCardDetails item={item} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StakingCardDetails({ item }: StakingCardProps) {
  const now = new Date();

  if (now < new Date(item.lockupPeriod)) {
    return (
      <div className="text-center">
        <p className="text-gray-500">Your NFT is currently locked-up.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-gray-500">Unlocked</p>
      <Link href={`/confirm-withdraw?id=${item.nftId}`}>
        <Button variant="primary" size="esm">
          Withdraw
        </Button>
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-[9px] text-gray-500">{label}</p>
      <span className="inline-flex items-center justify-center gap-x-[3.6px]">
        <Icons.stellar_mono className="size-[14px]" />
        <p className="text-[13px] font-semibold">{value}</p>
      </span>
    </div>
  );
}
