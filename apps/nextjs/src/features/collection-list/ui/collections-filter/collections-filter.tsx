import type { SortConfig, SortKey } from "../../model/types";
import { SortButton } from "./sort-button";

interface CollectionsFilterProps {
  sortConfig: SortConfig;
  sortCollections: (key: SortKey) => void;
  getSortLabel: (key: SortKey) => string;
}

export function CollectionsFilter({
  sortConfig,
  sortCollections,
  getSortLabel,
}: CollectionsFilterProps) {
  const sortTypes: SortKey[] = ["createdAt", "price", "bestOffer"];

  return (
    <div className="mb-4 flex flex-wrap gap-x-2 p-2">
      {sortTypes.map((sortType) => (
        <SortButton
          key={sortType}
          sortType={sortType}
          label={getSortLabel(sortType)}
          isActive={sortConfig.key === sortType}
          isAsc={sortConfig.key === sortType && sortConfig.order === "asc"}
          onClick={() => sortCollections(sortType)}
        />
      ))}
    </div>
  );
}
