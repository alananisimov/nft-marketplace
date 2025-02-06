import type { TCollection } from "../../model/collection.types";
import { CollectionBackground } from "./collection-background";
import { CollectionInfo } from "./collection-info";

interface CollectionHeaderProps {
  collection: TCollection;
}

export function CollectionHeader({ collection }: CollectionHeaderProps) {
  return (
    <>
      <CollectionBackground />
      <CollectionInfo collection={collection} />
    </>
  );
}
