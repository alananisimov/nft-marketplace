import type { DeliveryItem, NFT } from "@acme/db/schema";

import type { BaseEntity } from "../../../shared/domain/types";
import type { NFTResponse } from "../../nft/application/dto";

export interface DeliveryProps extends BaseEntity {
  nftId: string;
  nft?: NFTResponse;
  address: string;
  lockDate: number;
  status: "pending" | "processing" | "completed" | "failed";
  ordered: Date;
  processed?: Date;
  estimated?: Date;
  userId: string;
}

export type DeliveryFromDB = typeof DeliveryItem.$inferSelect & {
  nft: typeof NFT.$inferSelect;
};
