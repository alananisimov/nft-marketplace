import type { RouterOutputs } from "@acme/api";

export interface MarketState {
  selectedCollection?: string;
  searchQuery?: string;
  sortBy?: "price" | "date";
}

export type MarketNFT = RouterOutputs["nft"]["all"][number];
export type MarketCollection = RouterOutputs["collection"]["all"][number];
