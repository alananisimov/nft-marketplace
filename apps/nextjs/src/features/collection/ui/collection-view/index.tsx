"use client";

import { api } from "~/app/providers/trpc-provider/react";
import { CollectionContent } from "./collection-content";
import { CollectionHeader } from "./collection-header";

interface CollectionViewProps {
  id: string;
}

export function CollectionView({ id }: CollectionViewProps) {
  const [collection] = api.collection.byId.useSuspenseQuery({ id });

  return (
    <>
      <CollectionHeader collection={collection} />
      <CollectionContent collection={collection} />
    </>
  );
}
