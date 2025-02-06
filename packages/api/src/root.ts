import { authRouter } from "./router/auth";
import { collectionRouter } from "./router/collections";
import { deliveryRouter } from "./router/delivery";
import { imageRouter } from "./router/image";
import { nftRouter } from "./router/nft";
import { rewardRouter } from "./router/rewards";
import { stakingRouter } from "./router/staking";
import { verificationRouter } from "./router/verification";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  verification: verificationRouter,
  auth: authRouter,
  staking: stakingRouter,
  delivery: deliveryRouter,
  nft: nftRouter,
  collection: collectionRouter,
  rewards: rewardRouter,
  image: imageRouter,
});

export type AppRouter = typeof appRouter;
