import { notFound } from "next/navigation";
import RewardsDrawer from "~/features/staking/ui/staking-rewards/rewards-drawer";

interface ConfirmWithdrawPage {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function Rewards({ searchParams }: ConfirmWithdrawPage) {
  const nftId = (await searchParams).id;
  if (!nftId) {
    notFound();
  }

  return <RewardsDrawer nftId={nftId} />;
}
