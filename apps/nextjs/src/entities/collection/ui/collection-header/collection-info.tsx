import { Avatar, AvatarFallback } from "@acme/ui/avatar";
import { H2 } from "@acme/ui/typography";

import type { TCollection } from "../../model/collection.types";

import { Image } from "~/shared/ui/image";

export function CollectionInfo({ collection }: { collection: TCollection }) {
  return (
    <div className="absolute left-[50%] top-[142px] flex translate-x-[-50%] flex-col items-center gap-y-4">
      <div className="flex flex-col items-center gap-y-1">
        <Avatar className="size-[calc(7rem+22px)] border-[11px] border-white">
          <AvatarFallback />
          <Image
            height={64}
            width={64}
            src={collection.image}
            alt={collection.name}
            className="aspect-square h-full w-full"
          />
        </Avatar>
        <H2>{collection.name}</H2>
      </div>
      <div className="flex flex-col items-center gap-y-[-1px]">
        <span className="text-[18px] font-medium">
          {collection.nfts.length}
        </span>
        <p className="text-muted-foreground">Items</p>
      </div>
    </div>
  );
}
