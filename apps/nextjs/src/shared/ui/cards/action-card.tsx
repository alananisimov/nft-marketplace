import type { ComponentProps, ReactNode } from "react";

import { H4 } from "@acme/ui/typography";

import { Icons } from "../icons";
import { cn } from "@acme/ui";

interface ActionCardProps extends ComponentProps<"div"> {
  children: ReactNode;
  handleBack: () => void;
  title: string;
  leftButton?: ReactNode;
}

export function ActionCard({
  children,
  handleBack,
  title,
  leftButton,
  ...props
}: ActionCardProps) {
  return (
    <div
      {...props}
      className={cn(
        "relative rounded-xl border border-gray-200 bg-white",
        props.className,
      )}
    >
      <div className="flex items-center justify-center border-b border-gray-200 p-4 relative">
        <div className="flex items-center gap-x-2">
          <button
            className="absolute left-[14px] top-1/2 translate-y-[-50%]"
            onClick={handleBack}
          >
            <Icons.arrow_left className="size-[14px]" />
          </button>
          <H4>{title}</H4>
        </div>

        {leftButton}
      </div>
      {children}
    </div>
  );
}
