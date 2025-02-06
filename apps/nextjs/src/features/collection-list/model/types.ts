export type SortKey = "createdAt" | "price" | "bestOffer";
export type SortOrder = "asc" | "desc";

export interface SortConfig {
  key: SortKey;
  order: SortOrder;
}
