import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useWithdrawApi } from "../../api/withdraw.api";

export const useWithdraw = (id: string) => {
  const router = useRouter();
  const { getNFTById, createWithdraw } = useWithdrawApi();

  const [nft] = getNFTById(id);

  const handleWithdraw = async () => {
    try {
      await createWithdraw.mutateAsync(
        { nftId: id },
        {
          onError: () => {
            toast.error("Failed to create withdraw", {
              description: "Please try again later",
            });
          },
          onSuccess: () => {
            router.back();
          },
        },
      );
    } catch (error) {
      console.log(error);
    }
  };

  return {
    nft,
    handleWithdraw,
    isLoading: createWithdraw.isPending,
  };
};
