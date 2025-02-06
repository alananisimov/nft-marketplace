import { cn } from "@acme/ui";

import type { MarketCollection } from "../../model/market.types";
import { CollectionsList } from "~/features/collection-list/ui/collections-list";
import { ITEMS_PER_PAGE } from "../../model/constants";

interface CollectionsGridProps {
  collections: MarketCollection[];
  className?: string;
}

export function CollectionsGrid({
  collections,
  className,
}: CollectionsGridProps) {
  return (
    <CollectionsList
      collections={collections.slice(0, ITEMS_PER_PAGE)}
      className={cn("-ml-2 pr-4", className)}
    />
  );
}
