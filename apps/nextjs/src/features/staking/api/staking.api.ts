import { api } from "~/app/providers/trpc-provider/react";

export const useStakingApi = () => {
  const utils = api.useUtils();

  return {
    createStaking: api.staking.create.useMutation({
      onSuccess: () => {
        void utils.nft.available.invalidate();
        void utils.staking.my.invalidate();
      },
    }),
    myStaking: api.staking.my.useSuspenseQuery(),
    availableNFTs: api.nft.available.useSuspenseQuery(),
    getRewardsByNFTId: (nftId: string) =>
      api.rewards.byNFTId.useQuery(
        { id: nftId },
        {
          enabled: !!nftId,
        },
      ),
  };
};
