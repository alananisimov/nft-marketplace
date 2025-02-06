import "reflect-metadata";

import { container } from "tsyringe";

import { CollectionService } from "~/services/collection.service";
import { FileService } from "~/services/file.service";
import { NFTService } from "~/services/nft.service";
import { RewardService } from "~/services/reward.service";

container.register("FileService", {
  useClass: FileService,
});

container.register("NFTService", {
  useClass: NFTService,
});

container.register("CollectionService", {
  useClass: CollectionService,
});

container.register("RewardService", {
  useClass: RewardService,
});

export { container };
