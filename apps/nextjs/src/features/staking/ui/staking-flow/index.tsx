"use client";

import { AnimatePresence, motion } from "framer-motion";

import { useStaking } from "../../model/hooks/use-staking";
import { StakingStage } from "../../model/staking.types";
import { StakingConfirm } from "../staking-confirm";
import { StakingList } from "../staking-list";
import { StakingOrderConfirm } from "../staking-order-confirm";
import { StakingRewardConfirm } from "../staking-reward-confirm";
import { StakingRewardSelect } from "../staking-reward-select";
import { StakingSelect } from "../staking-select";
import { StakingSuccess } from "../staking-success";
import { pageTransition, pageVariants } from "./animations";
import { StakingFlowSkeleton } from "./skeleton";

export function StakingFlow() {
  const {
    state: { stage, isLoading, selectedNFT, selectedReward, error },
    actions: {
      handleBack,
      handleSelectNFT,
      handleSelectReward,
      handleConfirm,
      handleCreateStaking,
      setStage,
    },
    queries: { stakingItems, availableNFTs, availableRewards },
  } = useStaking();

  if (isLoading) {
    return <StakingFlowSkeleton />;
  }

  const renderContent = () => {
    switch (stage) {
      case StakingStage.LIST:
        return (
          <StakingList
            availableNFTs={availableNFTs}
            items={stakingItems}
            onSelectNew={() => setStage(StakingStage.SELECT)}
          />
        );
      case StakingStage.SELECT:
        return (
          <StakingSelect
            items={availableNFTs}
            onSelect={handleSelectNFT}
            onBack={handleBack}
          />
        );
      case StakingStage.CONFIRM:
        return (
          <StakingConfirm
            nft={selectedNFT}
            onConfirm={handleConfirm}
            onBack={handleBack}
          />
        );
      case StakingStage.REWARD_SELECT:
        return (
          <StakingRewardSelect
            rewards={availableRewards}
            nftId={selectedNFT?.id}
            onSelect={handleSelectReward}
            onBack={handleBack}
          />
        );
      case StakingStage.REWARD_CONFIRM:
        return (
          <StakingRewardConfirm
            reward={selectedReward}
            onConfirm={handleConfirm}
            onBack={handleBack}
          />
        );
      case StakingStage.ORDER_CONFIRM:
        return (
          <StakingOrderConfirm
            nft={selectedNFT}
            reward={selectedReward}
            onConfirm={handleCreateStaking}
            onBack={handleBack}
          />
        );
      case StakingStage.SUCCESS:
        return (
          <StakingSuccess
            nft={selectedNFT}
            onBack={() => setStage(StakingStage.LIST)}
          />
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stage}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-500">
            {error}
          </div>
        )}
        <div className="mr-4">{renderContent()}</div>
      </motion.div>
    </AnimatePresence>
  );
}
