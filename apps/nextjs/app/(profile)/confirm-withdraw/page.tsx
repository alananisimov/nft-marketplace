import { notFound } from "next/navigation";

import { WithdrawModal } from "~/features/withdraw/ui/withdraw-modal";

interface ConfirmWithdrawPage {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ConfirmWithdrawModal({
  searchParams,
}: ConfirmWithdrawPage) {
  const id = (await searchParams).id;
  if (!id) {
    notFound();
  }

  return <WithdrawModal nftId={id} />;
}
