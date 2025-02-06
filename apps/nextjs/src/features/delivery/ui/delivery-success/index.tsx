import type { TNFT } from "~/entities/nft/model/nft.types";
import { Image } from "~/shared/ui/image";
import { ActionCard } from "~/shared/ui/cards/action-card";

interface DeliverySuccessProps {
  nft?: TNFT;
  onBack: () => void;
}

export function DeliverySuccess({ nft, onBack }: DeliverySuccessProps) {
  return (
    <ActionCard handleBack={onBack} title="Delivery Success">
      <div className="flex flex-row items-center justify-center gap-x-[10px] pb-[28px] pt-[14px]">
        <Image
          src={nft?.image ?? "/avatar.png"}
          alt=""
          width={64}
          height={64}
          className="size-12 rounded-full"
        />
        <h4 className="text-[14px] font-semibold text-[#007AFF]">
          Your order is confirmed
        </h4>
      </div>
    </ActionCard>
  );
}
