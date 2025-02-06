"use client";

import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@acme/ui/fullscreen-dialog";

import { WithdrawConfirm } from "../withdraw-confirm";

interface WithdrawModalProps {
  nftId: string;
}

export function WithdrawModal({ nftId }: WithdrawModalProps) {
  const router = useRouter();

  const handleOpenChange = () => {
    router.back();
  };

  return (
    <Dialog defaultOpen={true} open={true} onOpenChange={handleOpenChange}>
      <DialogOverlay>
        <DialogTitle>Withdraw</DialogTitle>
        <DialogContent className="overflow-y-hidden">
          <WithdrawConfirm id={nftId} />
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
}
