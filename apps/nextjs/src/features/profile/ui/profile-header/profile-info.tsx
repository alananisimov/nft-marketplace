"use client";

import type { User } from "@telegram-apps/sdk-react";

import { Skeleton } from "@acme/ui/skeleton";
import { H2 } from "@acme/ui/typography";

import { api } from "~/app/providers/trpc-provider/react";
import { formatCompactNumber } from "~/shared/utils";
import { ProfileAvatar } from "../profile-avatar";

export function ProfileInfo({ profile }: { profile: User }) {
  const { data: nfts, isLoading } = api.nft.my.useQuery();

  return (
    <div className="absolute left-[50%] top-[142px] flex translate-x-[-50%] flex-col items-center gap-y-4">
      <div className="flex flex-col items-center gap-y-1">
        <ProfileAvatar profilePhoto={profile.photoUrl} />
        <H2 className="truncate">
          {profile.firstName} {profile.lastName}
        </H2>
      </div>
      <div className="flex flex-col items-center gap-y-[-1px]">
        {isLoading ? (
          <Skeleton className="h-4 w-16 rounded-sm" />
        ) : (
          <span className="text-[18px] font-medium">
            {formatCompactNumber(nfts?.length)}
          </span>
        )}
        <p className="text-muted-foreground">Items</p>
      </div>
    </div>
  );
}
