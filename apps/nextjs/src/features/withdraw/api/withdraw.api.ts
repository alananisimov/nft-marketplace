"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { api } from "~/app/providers/trpc-provider/react";

export const useWithdrawApi = () => {
  const router = useRouter();
  return {
    getNFTById: (id: string) => api.nft.byId.useSuspenseQuery({ id }),
    createWithdraw: api.staking.withdraw.useMutation({
      onError: () => {
        toast.error("Failed to create withdraw", {
          description: "Please try again later",
        });
      },
      onSuccess: () => {
        toast.success("Successfully withdrawed NFT");
        router.back();
      },
    }),
  };
};
