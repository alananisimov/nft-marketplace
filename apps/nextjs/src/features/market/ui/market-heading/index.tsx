import type { ComponentProps } from "react";
import Link from "next/link";

import { cn } from "@acme/ui";
import { H2 } from "@acme/ui/typography";

import { dmSans } from "~/fonts/dm-sans";
import { sfPro } from "~/fonts/sf-pro";

interface MarketHeadingProps extends ComponentProps<"div"> {
  title: string;
  viewAllLink?: string;
}

export function MarketHeading({
  title,
  viewAllLink,
  ...props
}: MarketHeadingProps) {
  return (
    <div
      {...props}
      className={cn(
        "flex flex-row items-center justify-between pr-6",
        props.className,
      )}
    >
      <H2 className={dmSans.className}>{title}</H2>
      {viewAllLink && (
        <Link
          href={viewAllLink}
          className={cn(
            sfPro.className,
            "text-[14px] font-semibold text-[#64748B]",
          )}
        >
          View All
        </Link>
      )}
    </div>
  );
}
