import { Suspense } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";

import { CollectionsCarouselLoading } from "~/features/collection-list/ui/collections-carousel";
import { StakingFlow } from "~/features/staking/ui/staking-flow";
import { StakingFlowSkeleton } from "~/features/staking/ui/staking-flow/skeleton";
import { Icons } from "~/shared/ui/icons";
import { ProfileCollections } from "../profile-view/profile-collections";

export function ProfileTabs() {
  return (
    <Tabs defaultValue="collection" className="overflow-hidden">
      <TabsList className="grid grid-cols-2 pr-4">
        <TabsTrigger value="collection" icon={<Icons.ticket_star />}>
          Collection
        </TabsTrigger>
        <TabsTrigger value="staking" icon={<Icons.discovery />}>
          Staking
        </TabsTrigger>
      </TabsList>
      <TabsContent value="collection">
        <Suspense fallback={<CollectionsCarouselLoading />}>
          <ProfileCollections />
        </Suspense>
      </TabsContent>
      <TabsContent value="staking">
        <Suspense fallback={<StakingFlowSkeleton />}>
          <StakingFlow />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
