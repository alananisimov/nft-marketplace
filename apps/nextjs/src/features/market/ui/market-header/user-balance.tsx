import { Skeleton } from "@acme/ui/skeleton";

import { api } from "~/app/providers/trpc-provider/react";

export function UserBalance() {
  const { data: balance, isLoading } = api.auth.balance.useQuery(undefined);
  return (
    <>
      {isLoading ? (
        <Skeleton className="h-4 w-16 rounded-sm" />
      ) : (
        <span className="text-xs font-semibold">{balance} XLM</span>
      )}
    </>
  );
}
