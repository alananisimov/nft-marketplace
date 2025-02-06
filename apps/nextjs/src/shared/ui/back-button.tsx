"use client";

import type { ComponentProps } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@acme/ui";

import { Icons } from "./icons";

export function BackButton(props: ComponentProps<"button">) {
  const router = useRouter();
  return (
    <button
      {...props}
      onClick={() => router.back()}
      className={cn("size-8", props.className)}
    >
      <Icons.chevron_left />
    </button>
  );
}
