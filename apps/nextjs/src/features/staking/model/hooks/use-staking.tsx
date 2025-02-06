import { useEffect, useState } from "react";
import { useAtom } from "jotai";

import { useSession } from "@acme/auth";

import type { StakingState } from "../staking.types";
import type { TNFT } from "~/entities/nft/model/nft.types";
import type { TReward } from "~/entities/reward/model/reward.types";
import { useStakingApi } from "../../api/staking.api";
import { StakingStage } from "../staking.types";
import { selectedStakingNFTAtom } from "../store";

export function useStaking() {
  const [state, setState] = useState<StakingState>({
    stage: StakingStage.LIST,
    isLoading: false,
    selectedNFT: undefined,
    selectedReward: undefined,
    error: undefined,
  });

  const [, setSelectedStakingNFT] = useAtom(selectedStakingNFTAtom);

  const {
    createStaking,
    myStaking: [stakingItems],
    availableNFTs: [availableNFTs],
    getRewardsByNFTId,
  } = useStakingApi();

  const { session } = useSession();

  const { data: availableRewards, isLoading: isLoadingRewards } =
    getRewardsByNFTId(state.selectedNFT?.id ?? "");

  useEffect(() => {
    if (state.stage !== StakingStage.LIST) {
      setState((prev) => ({ ...prev, isLoading: true }));
      const timer = setTimeout(() => {
        setState((prev) => ({ ...prev, isLoading: false }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.stage]);

  const setStage = (newStage: StakingStage) => {
    setState((prev) => ({ ...prev, stage: newStage }));
  };

  const handleBack = () => {
    setState((prev) => {
      let newStage: StakingStage;
      switch (prev.stage) {
        case StakingStage.SELECT:
          newStage = StakingStage.LIST;
          break;
        case StakingStage.CONFIRM:
          newStage = StakingStage.SELECT;
          break;
        case StakingStage.REWARD_SELECT:
          newStage = StakingStage.CONFIRM;
          break;
        case StakingStage.REWARD_CONFIRM:
          newStage = StakingStage.REWARD_SELECT;
          break;
        case StakingStage.ORDER_CONFIRM:
          newStage = StakingStage.REWARD_CONFIRM;
          break;
        case StakingStage.SUCCESS:
          newStage = StakingStage.LIST;
          break;
        default:
          newStage = StakingStage.LIST;
      }
      return { ...prev, stage: newStage };
    });
  };

  const handleSelectNFT = (nft: TNFT) => {
    setSelectedStakingNFT(nft);
    setState((prev) => ({
      ...prev,
      selectedNFT: nft,
      stage: StakingStage.CONFIRM,
    }));
  };

  const handleConfirm = () => {
    setState((prev) => {
      let newStage: StakingStage;
      switch (prev.stage) {
        case StakingStage.CONFIRM:
          newStage = StakingStage.REWARD_SELECT;
          break;
        case StakingStage.REWARD_CONFIRM:
          newStage = StakingStage.ORDER_CONFIRM;
          break;
        case StakingStage.ORDER_CONFIRM:
          newStage = StakingStage.SUCCESS;
          break;
        default:
          newStage = prev.stage;
      }
      return { ...prev, stage: newStage };
    });
  };

  const handleSelectReward = (reward: TReward) => {
    setState((prev) => ({
      ...prev,
      selectedReward: reward,
      stage: StakingStage.REWARD_CONFIRM,
    }));
  };

  const handleCreateStaking = async () => {
    await createStaking.mutateAsync({
      nftId: state.selectedNFT?.id ?? "",
      userId: session?.user.userId ?? "",
      nftRewardId: state.selectedReward?.id ?? "",
    });

    handleConfirm();
  };

  return {
    state: {
      ...state,
      isLoading: state.isLoading || isLoadingRewards,
    },
    actions: {
      handleBack,
      handleSelectNFT,
      handleSelectReward,
      handleConfirm,
      handleCreateStaking,
      setStage,
    },
    queries: {
      stakingItems,
      availableNFTs,
      availableRewards: availableRewards ?? [],
      createStaking,
      isLoading: isLoadingRewards,
    },
  };
}
