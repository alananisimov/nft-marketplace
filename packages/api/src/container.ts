import "reflect-metadata";

import { container, Lifecycle } from "tsyringe";

import { AuthService } from "./modules/auth/application/auth.service";
import { AuthRepository } from "./modules/auth/infrastructure/auth.repository";
import { CollectionService } from "./modules/collection/application/collection.service";
import { CollectionRepository } from "./modules/collection/infrastructure/collection.repository";
import { DeliveryService } from "./modules/delivery/application/delivery.service";
import { DeliveryRepository } from "./modules/delivery/infrastructure/delivery.repository";
import { ImageService } from "./modules/images/application/image.service";
import { MinioService } from "./modules/images/infrastructure/minio.service";
import { NFTService } from "./modules/nft/application/nft.service";
import { MarketService } from "./modules/nft/infrastructure/market.service";
import { NFTRepository } from "./modules/nft/infrastructure/nft.repository";
import { StellarService } from "./modules/nft/infrastructure/stellar.service";
import { RewardService } from "./modules/reward/application/reward.service";
import { RewardRepository } from "./modules/reward/infrastructure/reward.repository";
import { StakingService } from "./modules/staking/application/staking.service";
import { StakingRepository } from "./modules/staking/infrastructure/staking.repository";
import { VerificationService } from "./modules/verification/application/verification.service";
import { StellarService as VerificationStellarService } from "./modules/verification/infrastructure/stellar.service";
import { VerificationRepository } from "./modules/verification/infrastructure/verification.repository";
import { ImageProcessor } from "./shared/infrastructure/image-processor";

container.register(
  "MinioService",
  {
    useClass: MinioService,
  },
  { lifecycle: Lifecycle.Singleton },
);

container.register(
  "StellarService",
  {
    useClass: StellarService,
  },
  { lifecycle: Lifecycle.Singleton },
);

container.register(
  "VerificationStellarService",
  {
    useClass: VerificationStellarService,
  },
  { lifecycle: Lifecycle.Singleton },
);

container.register(
  "NFTRepository",
  { useClass: NFTRepository },
  { lifecycle: Lifecycle.Singleton },
);
container.register(
  "CollectionRepository",
  { useClass: CollectionRepository },
  { lifecycle: Lifecycle.Singleton },
);
container.register(
  "RewardRepository",
  { useClass: RewardRepository },
  { lifecycle: Lifecycle.Singleton },
);
container.register(
  "StakingRepository",
  { useClass: StakingRepository },
  { lifecycle: Lifecycle.Singleton },
);
container.register(
  "DeliveryRepository",
  { useClass: DeliveryRepository },
  { lifecycle: Lifecycle.Singleton },
);
container.register(
  "VerificationRepository",
  {
    useClass: VerificationRepository,
  },
  { lifecycle: Lifecycle.Singleton },
);
container.register(
  "MarketService",
  { useClass: MarketService },
  { lifecycle: Lifecycle.Singleton },
);
container.register(
  "ImageService",
  { useClass: ImageService },
  { lifecycle: Lifecycle.Singleton },
);
container.register(
  "ImageProcessor",
  { useClass: ImageProcessor },
  { lifecycle: Lifecycle.Singleton },
);
container.register(
  "NFTService",
  { useClass: NFTService },
  { lifecycle: Lifecycle.Singleton },
);
container.register(
  "CollectionService",
  { useClass: CollectionService },
  { lifecycle: Lifecycle.Singleton },
);
container.register(
  "RewardService",
  { useClass: RewardService },
  { lifecycle: Lifecycle.Singleton },
);
container.register(
  "StakingService",
  { useClass: StakingService },
  { lifecycle: Lifecycle.Singleton },
);
container.register(
  "DeliveryService",
  { useClass: DeliveryService },
  { lifecycle: Lifecycle.Singleton },
);
container.register(
  "VerificationService",
  {
    useClass: VerificationService,
  },
  { lifecycle: Lifecycle.Singleton },
);
container.register(
  "AuthRepository",
  { useClass: AuthRepository },
  { lifecycle: Lifecycle.Singleton },
);
container.register(
  "AuthService",
  { useClass: AuthService },
  { lifecycle: Lifecycle.Singleton },
);

export { container };
