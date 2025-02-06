import type { TCollection } from "~/entities/collection/model/collection.types";
import { useCollectionsSort } from "../../model/hooks/use-collections-sort";
import { CollectionsFilter } from "../collections-filter/collections-filter";
import { CollectionsList } from "./collections-list";

export function CollectionsListWithFilter({
  collections: initialCollections,
}: {
  collections: TCollection[];
}) {
  const { sortedCollections, sortConfig, sortCollections, getSortLabel } =
    useCollectionsSort(initialCollections);

  return (
    <div>
      <CollectionsFilter
        sortConfig={sortConfig}
        getSortLabel={getSortLabel}
        sortCollections={sortCollections}
      />
      <CollectionsList collections={sortedCollections} />
    </div>
  );
}
