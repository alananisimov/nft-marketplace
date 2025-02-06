import { auth } from "@acme/auth";

import { MarketView } from "~/features/market/ui/market-view";

export default async function MarketPage() {
  const session = await auth();
  return <MarketView session={session} />;
}
