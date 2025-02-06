"use client";

import { Skeleton } from "@acme/ui/skeleton";
import { motion } from "framer-motion";

export function StakingFlowSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <div className="flex flex-col gap-y-4 mr-4 p-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-row justify-center mt-1">
            <Skeleton className="h-4 w-32" />
          </div>
        </motion.div>

        <div className="space-y-4">
          {[1].map((i) => (
            <StakingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function StakingCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-x-3">
          <SkeletonWithPulse className="size-12 rounded-lg" />
          <div className="space-y-2">
            <SkeletonWithPulse className="h-4 w-24" />
            <SkeletonWithPulse className="h-3 w-16" />
          </div>
        </div>
        <SkeletonWithPulse className="h-4 w-20" />
      </div>
    </motion.div>
  );
}

interface SkeletonWithPulseProps {
  className?: string;
}

function SkeletonWithPulse({ className }: SkeletonWithPulseProps) {
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
      <Skeleton className={className} />
    </motion.div>
  );
}
