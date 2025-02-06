"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@acme/ui/button";

import type { TDeliveryItem } from "../../model/delivery.types";
import { Image } from "~/shared/ui/image";
import { DeliveryStatus } from "./delivery-status";

interface DeliveryCardProps {
  item: TDeliveryItem;
}

export function DeliveryCard({ item }: DeliveryCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-x-3">
          <Link href={`/nft/${item.nft.id}`}>
            <Image
              src={item.nft.image}
              alt={item.nft.name}
              width={200}
              height={200}
              className="size-12 rounded-lg object-cover"
            />
          </Link>
          <div className="space-y-1">
            <h4 className="text-[16px] font-medium">{item.nft.name}</h4>
            <p className="text-[13px] text-gray-500">{item.nft.description}</p>
          </div>
        </div>

        <Button
          variant="accent"
          size="track"
          onClick={() => setShowDetails((v) => !v)}
        >
          Track Delivery
        </Button>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="border-t border-gray-200 p-4">
              <DeliveryStatus item={item} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
