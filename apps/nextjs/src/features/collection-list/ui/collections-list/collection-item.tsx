"use client";

import type { ComponentProps } from "react";

import { Avatar, AvatarFallback } from "@acme/ui/avatar";
import { Skeleton } from "@acme/ui/skeleton";
import { H4 } from "@acme/ui/typography";

import type { TCollection } from "~/entities/collection/model/collection.types";
import { Icons } from "~/shared/ui/icons";
import { cn, formatPriceChange } from "~/shared/utils";
import { Image } from "~/shared/ui/image";

interface CollectionItemProps extends ComponentProps<"div"> {
  collection: TCollection;
}
export function CollectionItem({ collection, ...props }: CollectionItemProps) {
  return (
    <div
      className="flex flex-row justify-between rounded-md p-2 transition-opacity duration-300 ease-in-out hover:bg-gray-200/50"
      {...props}
    >
      <div className="flex flex-row gap-x-4">
        <Avatar className="size-12 stroke-white stroke-2">
          <AvatarFallback />
          <Image
            src={collection.image}
            alt={collection.name}
            width={64}
            height={64}
            className="aspect-square h-full w-full"
          />
        </Avatar>
        <div className="flex flex-col justify-center gap-y-1">
          <span className="text-[16px] font-medium text-foreground">
            {collection.name}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-y-2">
        <span className="inline-flex items-center gap-x-1">
          <Icons.stellar_mono className="size-[18px] text-[#202020]" />
          <H4 className="text-[16px]">{collection.price}</H4>
        </span>
        <PriceChange change={collection.priceChange} className="text-[14px]" />
      </div>
    </div>
  );
}

function PriceChange({
  change,
  ...props
}: { change: number } & ComponentProps<"span">) {
  const formatted = formatPriceChange(change);
  return (
    <span
      {...props}
      className={cn(
        change > 0 ? "text-success" : "text-destructive",
        props.className,
      )}
    >
      {formatted}
    </span>
  );
}

export function CollectionItemSkeleton() {
  return (
    <div className="flex flex-row justify-between rounded-md p-2">
      <div className="flex flex-row gap-x-4">
        <Skeleton className="size-12 rounded-full" />
        <div className="flex flex-col justify-center gap-y-1">
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center gap-x-1">
          <Skeleton className="size-[18px]" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  );
}
