"use client";

import { api } from "~/app/providers/trpc-provider/react";
import { CollectionsCarousel } from "~/features/collection-list/ui/collections-carousel";

export function ProfileCollections() {
  const [collections] = api.collection.my.useSuspenseQuery();
  return <CollectionsCarousel collections={collections} />;
}
