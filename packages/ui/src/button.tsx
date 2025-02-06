import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from ".";

const buttonVariants = cva(
  "focus-visible:ring-ring inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground drop-shadow-lg hover:bg-primary/90",
        accent:
          "bg-[#007AFF] text-[9px] font-semibold text-white drop-shadow-lg focus:bg-white focus:text-primary",
        light: "bg-white text-primary hover:bg-white/90 drop-d",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        track: "h-7 rounded-[6px] px-4 py-[3px]",
        esm: "h-7 rounded-[7px] px-4 py-2 text-[8px] font-bold",
        sm: "h-[44px] rounded-md px-4 py-2 text-xs font-bold",
        md: "h-[48px] rounded-lg px-6 py-4 text-[16px] font-bold",
        lg: "h-[60px] rounded-lg px-8 font-medium",
        light: "h-[52px] rounded-md text-[14px] font-semibold",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={props.disabled ?? loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
            {loadingText ?? "Loading..."}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps, ButtonVariants };
