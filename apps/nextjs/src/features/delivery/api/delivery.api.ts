"use client";

import { api } from "~/app/providers/trpc-provider/react";

export const useDeliveryApi = () => {
  const utils = api.useUtils();

  return {
    createDelivery: api.delivery.create.useMutation({
      onSuccess: () => {
        void utils.nft.available.invalidate();
        void utils.delivery.my.invalidate();
      },
    }),
    myDeliveries: api.delivery.my.useSuspenseQuery(),
    availableNFTs: api.nft.available.useSuspenseQuery(),
  };
};
