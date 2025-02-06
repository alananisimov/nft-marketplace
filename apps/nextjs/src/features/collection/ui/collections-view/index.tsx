"use client";

import { api } from "~/app/providers/trpc-provider/react";
import { CollectionsListWithFilter } from "~/features/collection-list/ui/collections-list";
import { CollectionsHeader } from "./collections-header";

export function CollectionsView() {
  const [collections] = api.collection.all.useSuspenseQuery();
  return (
    <div className="flex flex-col gap-y-4">
      <CollectionsHeader />
      <CollectionsListWithFilter collections={collections} />
    </div>
  );
}
