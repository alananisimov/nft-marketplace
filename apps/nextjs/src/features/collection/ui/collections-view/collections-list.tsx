import type { TCollection } from "~/entities/collection/model/collection.types";

import { CollectionCard } from "~/entities/collection/ui/collection-card";

interface CollectionsListProps {
  collections: TCollection[];
  className?: string;
}

export function CollectionsList({
  collections,
  className,
}: CollectionsListProps) {
  return (
    <div className={className}>
      {collections.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          className="mb-4"
        />
      ))}
    </div>
  );
}
