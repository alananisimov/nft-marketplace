import { cn } from "@acme/ui";

import type { TDeliveryItem } from "../../model/delivery.types";
import { formatDeliveryDate } from "~/shared/utils";

export function DeliveryStatus({ item }: { item: TDeliveryItem }) {
  return (
    <div className="grid grid-cols-3 gap-x-[10px]">
      <StatusStep status="ordered" date={item.ordered} />
      <StatusStep status="processed" date={item.processed} />
      <StatusStep status="estimated" date={item.estimated} />
    </div>
  );
}

function StatusStep({ status, date }: { status: string; date?: Date }) {
  return (
    <div className="flex flex-col gap-y-[3px]">
      <div
        className={cn(
          "h-[7px] w-full rounded-md",
          date ? "bg-[#007AFF]" : "bg-[#C4C4C4]",
        )}
      />
      <div className="flex flex-col text-center">
        <h4 className="text-[11px] font-semibold uppercase">{status}</h4>
        <p className="text-[8px] font-medium text-[#1D1D1D]/50">
          {date ? formatDeliveryDate(date) : "-"}
        </p>
      </div>
    </div>
  );
}
