"use client";

import { Skeleton } from "@acme/ui/skeleton";
import { H1, H2 } from "@acme/ui/typography";

import type { TNFT } from "~/entities/nft/model/nft.types";
import { api } from "~/app/providers/trpc-provider/react";
import { BackButton } from "~/shared/ui/back-button";

export function NFTHeader({ nft }: { nft: TNFT }) {
  const { data: collection, isLoading } = api.collection.byId.useQuery({
    id: nft.collectionId,
  });
  return (
    <div className="flex flex-row items-center justify-between gap-x-4">
      <BackButton />
      {isLoading ? (
        <Skeleton className="h-10 w-20" />
      ) : (
        <div className="flex flex-col gap-y-1 text-right">
          <H1>{nft.name}</H1>
          <H2 className="text-[#D9D9D9]">{collection?.name}</H2>
        </div>
      )}
    </div>
  );
}
