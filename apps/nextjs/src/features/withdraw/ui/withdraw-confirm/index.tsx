"use client";

import { useRouter } from "next/navigation";

import { Button } from "@acme/ui/button";

import { Image } from "~/shared/ui/image";
import { Icons } from "~/shared/ui/icons";
import { useWithdraw } from "../../model/hooks/use-withdraw";

interface WithdrawConfirmProps {
  id: string;
}

export function WithdrawConfirm({ id }: WithdrawConfirmProps) {
  const { nft, handleWithdraw, isLoading } = useWithdraw(id);
  const router = useRouter();

  return (
    <>
      <button onClick={() => router.back()} className="size-8">
        <Icons.chevron_left />
      </button>

      <div className="mx-6 flex flex-1 flex-col items-center justify-center gap-y-10 text-center">
        <div className="max-h-[300px]">
          <Image
            src={nft.image}
            alt={nft.name}
            height={300}
            width={200}
            className="h-full w-full rounded-lg border-2 border-black object-contain"
          />
        </div>
        <h2 className="text-2xl">
          Withdraw <span className="font-semibold">{nft.currentBid} XLM</span>{" "}
          to your Stellar Account?
        </h2>

        <Button
          size="lg"
          variant="primary"
          className="px-16 text-xl font-semibold"
          onClick={handleWithdraw}
          disabled={isLoading}
        >
          Confirm
        </Button>
      </div>
    </>
  );
}
