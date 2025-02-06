import { useCallback, useMemo } from "react";
import { useAtom } from "jotai";

import type { SortConfig, SortKey, SortOrder } from "../types";
import type { TCollection } from "~/entities/collection/model/collection.types";
import { collectionsSortAtom } from "../store";

interface UseCollectionsSortReturn {
  sortedCollections: TCollection[];
  sortConfig: SortConfig;
  sortCollections: (key: SortKey) => void;
  getSortLabel: (key: SortKey) => string;
}

export function useCollectionsSort(
  collections: TCollection[],
): UseCollectionsSortReturn {
  const [sortConfig, setSortConfig] = useAtom(collectionsSortAtom);

  const getMaxBid = useCallback((collection: TCollection) => {
    return collection.nfts.reduce(
      (maxBid, nft) => Math.max(maxBid, nft.currentBid),
      0,
    );
  }, []);

  const sortCollections = useCallback(
    (key: SortKey) => {
      const newOrder: SortOrder =
        sortConfig.key === key && sortConfig.order === "desc" ? "asc" : "desc";

      setSortConfig({ key, order: newOrder });
    },
    [sortConfig.key, sortConfig.order, setSortConfig],
  );

  const sortedCollections = useMemo(() => {
    return [...collections].sort((a, b) => {
      let result = 0;
      const maxBidA = getMaxBid(a);
      const maxBidB = getMaxBid(b);

      switch (sortConfig.key) {
        case "createdAt":
          result =
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case "price":
          result = b.price - a.price;
          break;
        case "bestOffer":
          result = maxBidB - maxBidA;
          break;
        default:
          result = 0;
      }

      return sortConfig.order === "asc" ? result * -1 : result;
    });
  }, [collections, sortConfig.key, sortConfig.order, getMaxBid]);

  const getSortLabel = useCallback((key: SortKey): string => {
    const labels: Record<SortKey, string> = {
      createdAt: "New",
      price: "Price",
      bestOffer: "Best offer",
    };
    return labels[key];
  }, []);

  return {
    sortedCollections,
    sortConfig,
    sortCollections,
    getSortLabel,
  };
}
