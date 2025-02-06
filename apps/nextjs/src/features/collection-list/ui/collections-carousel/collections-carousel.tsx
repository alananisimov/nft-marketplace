import Link from "next/link";

import { Carousel, CarouselContent, CarouselItem } from "@acme/ui/carousel";

import type { TCollection } from "~/entities/collection/model/collection.types";
import { CollectionCard } from "~/entities/collection/ui/collection-card";
import { CollectionCardLoading } from "~/entities/collection/ui/collection-card/collection-card";

interface CollectionsCarouselProps {
  collections: TCollection[];
}

export function CollectionsCarousel({ collections }: CollectionsCarouselProps) {
  return (
    <Carousel className="w-full">
      <CarouselContent>
        {collections.map((collection) => (
          <CarouselItem key={collection.id} className="basis-[55%]">
            <Link href={`/collection/${collection.id}`}>
              <CollectionCard collection={collection} />
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

export function CollectionsCarouselLoading() {
  return (
    <div className="relative flex w-full flex-row gap-x-4 overflow-hidden">
      {Array.from({ length: 2 }).map((_, i) => (
        <CollectionCardLoading key={i} />
      ))}
    </div>
  );
}
