import { cn } from "@acme/ui";

import type { SortKey } from "../../model/types";
import { dmSans } from "~/fonts/dm-sans";
import { Icons } from "~/shared/ui/icons";

interface SortButtonProps {
  sortType: SortKey;
  label: string;
  isActive: boolean;
  isAsc: boolean;
  onClick: () => void;
}

export function SortButton({
  label,
  isActive,
  isAsc,
  onClick,
}: SortButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        dmSans.className,
        "flex flex-row items-center gap-x-1 text-[14px] font-bold",
        isActive && "text-primary",
      )}
    >
      {label}
      <Icons.triagle
        className={cn("h-[7px]", {
          "rotate-180": isAsc,
          "opacity-50": !isActive,
        })}
      />
    </button>
  );
}
