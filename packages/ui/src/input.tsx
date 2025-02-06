"use client";

import * as React from "react";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";

import { cn } from ".";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
  focusedIcon?: React.ReactNode;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type: _type, icon, focusedIcon, ...props }, ref) => {
    const [type, setType] = React.useState(_type);
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    const handleShowPassword = () => {
      setShowPassword((v) => !v);

      setType(showPassword ? "text" : "password");
    };

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (props.onFocus) {
        props.onFocus(event);
      }
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (props.onBlur) {
        props.onBlur(event);
      }
    };

    return (
      <div className="group relative flex w-full items-center gap-x-5">
        {(icon ?? focusedIcon) && (
          <div className="absolute left-5 flex size-[18px] items-center justify-center text-[#C2C3CB] transition-colors">
            {isFocused && focusedIcon ? focusedIcon : icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "text-md h-[60px] w-full rounded-lg bg-transparent bg-white p-5 pl-[60px] font-medium transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#C2C3CB] focus:placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-50",
            className,
            type === "password" && "pr-[54px]",
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {_type === "password" && (
          <button
            type="button"
            onClick={() => handleShowPassword()}
            className="absolute right-5 z-10 text-[#C2C3CB] transition-colors"
          >
            {showPassword && !props.disabled ? (
              <EyeOpenIcon className="size-[18px]" aria-hidden="true" />
            ) : (
              <EyeClosedIcon className="size-[18px]" aria-hidden="true" />
            )}
          </button>
        )}
        <span className="sr-only">
          {showPassword ? "Hide password" : "Show password"}
        </span>
      </div>
    );
  },
);
Input.displayName = "Input";

type InputIconProps = React.ComponentProps<"div">;

const InputIcon = React.forwardRef<SVGElement, InputIconProps>(
  ({ className, ...props }, _ref) => {
    return (
      <div
        className={cn(
          "absolute left-5 size-[18px] text-[#C2C3CB] group-focus:text-primary",
          className,
        )}
        {...props}
      />
    );
  },
);
InputIcon.displayName = "InputIcon";

type DefaultInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const DefaultInput = React.forwardRef<HTMLInputElement, DefaultInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "border-input focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input, InputIcon, DefaultInput };
