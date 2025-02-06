"use client";

import { motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Skeleton } from "@acme/ui/skeleton";

import { ActionCard } from "~/shared/ui/cards/action-card";

export function Loading({ handleBack }: { handleBack: () => void }) {
  return (
    <ActionCard handleBack={handleBack} title="">
      <div className="h-32">
        <div className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%]">
          <LoaderCircle className="h-5 w-5 animate-spin" />
        </div>
      </div>
    </ActionCard>
  );
}

export function DeliverySkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0.4 }}
      animate={{
        opacity: [0.4, 0.7, 0.4],
      }}
      transition={{
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity,
      }}
    >
      <div className="flex flex-col gap-y-4 pr-6">
        <Button variant="light" size="light" disabled>
          <Skeleton className="h-4 w-40" />
        </Button>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <DeliveryCardSkeleton
              key={index}
              delay={index * 0.15} // Stagger effect
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

interface DeliveryCardSkeletonProps {
  delay?: number;
}

function DeliveryCardSkeleton({ delay = 0 }: DeliveryCardSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: "easeOut",
      }}
    >
      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-x-3">
          <Skeleton className="size-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
    </motion.div>
  );
}
