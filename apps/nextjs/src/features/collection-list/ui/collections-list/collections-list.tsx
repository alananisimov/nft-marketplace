import type { ComponentProps } from "react";
import Link from "next/link";

import { cn } from "@acme/ui";

import type { TCollection } from "~/entities/collection/model/collection.types";
import { CollectionItem } from "./collection-item";

interface CollectionsListProps extends ComponentProps<"div"> {
  collections: TCollection[];
}

export function CollectionsList({
  collections,
  ...props
}: CollectionsListProps) {
  return (
    <div {...props} className={cn("flex flex-col gap-y-2", props.className)}>
      {collections.map((collection) => (
        <Link href={`/collection/${collection.id}`} key={collection.id}>
          <CollectionItem collection={collection} />
        </Link>
      ))}
    </div>
  );
}
