import type { ComponentProps } from "react";

import { cn } from "@acme/ui";
import { Skeleton } from "@acme/ui/skeleton";

import type { TCollection } from "../../model/collection.types";
import { sfPro } from "~/fonts/sf-pro";
import { Image } from "~/shared/ui/image";
import { Icons } from "~/shared/ui/icons";
import { formatPrice } from "~/shared/utils";

interface CollectionCardProps extends ComponentProps<"div"> {
  collection: TCollection;
}

export function CollectionCard({ collection, ...props }: CollectionCardProps) {
  return (
    <div
      {...props}
      className={cn(
        "flex flex-col gap-y-[2px] rounded-md bg-white p-[5px]",
        props.className,
      )}
    >
      <div className="relative">
        <div className="h-[142px] rounded-[5px] bg-[#C4C4C4]" />
        <Image
          src={collection.image}
          alt={collection.name}
          width={200}
          height={200}
          className={cn(
            "absolute left-0 top-0 h-[142px] w-full rounded-[5px] object-cover",
          )}
        />
      </div>
      <h3 className="text-[16px] font-semibold">{collection.name}</h3>
      <div className="inline-flex justify-between p-[3px]">
        <CollectionPrice price={collection.price} />
        <CollectionLikes />
      </div>
    </div>
  );
}

export function CollectionCardLoading() {
  return (
    <div className="flex min-w-0 shrink-0 grow-0 basis-[55%] flex-col gap-y-[2px] p-[5px]">
      <Skeleton className="h-[142px]" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-6 w-1/2" />
      <div className="flex h-[30px] flex-row items-center justify-between">
        <Skeleton className="w-16" />
        <Skeleton className="h-9 w-16" />
      </div>
    </div>
  );
}

function CollectionPrice({ price }: { price: number }) {
  return (
    <div className="inline-flex items-center gap-x-1">
      <Icons.stellar_mono className="size-[14px]" />
      <h4 className={cn(sfPro.className, "text-[16px] font-semibold")}>
        {formatPrice(price)}
      </h4>
    </div>
  );
}

function CollectionLikes({ likes = 200 }: { likes?: number }) {
  return (
    <div className="inline-flex items-center gap-x-1 text-[#888888]">
      <Icons.heart className="size-[11px]" />
      <span className={cn(sfPro.className, "text-[11px] font-semibold")}>
        {likes}
      </span>
    </div>
  );
}
