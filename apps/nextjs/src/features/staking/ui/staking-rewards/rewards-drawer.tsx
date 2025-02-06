"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@acme/ui/drawer";

import { RewardsView } from "./rewards-view";
import { api } from "~/app/providers/trpc-provider/react";
import { useAtom } from "jotai";
import { rewardsDrawerOpenAtom } from "../../model/store";

interface RewardsDrawerProps {
  nftId: string;
}

export default function RewardsDrawer({ nftId }: RewardsDrawerProps) {
  const [open, setOpen] = useAtom(rewardsDrawerOpenAtom);
  const [nft] = api.nft.byId.useSuspenseQuery({
    id: nftId,
  });
  const [rewards] = api.rewards.byNFTId.useSuspenseQuery({
    id: nftId,
  });

  return (
    <Drawer open={open} onOpenChange={() => setOpen((v) => !v)}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Rewards Information</DrawerTitle>
        </DrawerHeader>
        <RewardsView rewards={rewards} nft={nft} />
      </DrawerContent>
    </Drawer>
  );
}
