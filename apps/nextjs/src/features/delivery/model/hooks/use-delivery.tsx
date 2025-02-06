"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";

import type { TDeliveryForm } from "../delivery.types";
import type { TNFT } from "~/entities/nft/model/nft.types";
import { api } from "~/app/providers/trpc-provider/react";
import { selectedDeliveryNFTAtom } from "../store";

export enum DeliveryStage {
  LIST = "LIST",
  SELECT = "SELECT",
  CONFIRM = "CONFIRM",
  FORM = "FORM",
  SUCCESS = "SUCCESS",
}

interface DeliveryState {
  stage: DeliveryStage;
  isLoading: boolean;
  selectedNFT?: TNFT;
  error?: string;
}

export function useDelivery() {
  const [state, setState] = useState<DeliveryState>({
    stage: DeliveryStage.LIST,
    isLoading: false,
    selectedNFT: undefined,
    error: undefined,
  });

  const [, setSelectedDeliveryNFT] = useAtom(selectedDeliveryNFTAtom);

  const utils = api.useUtils();

  const { data: deliveryNFTs, isLoading: isLoadingDeliveries } =
    api.delivery.my.useQuery();

  const { data: availableNFTs, isLoading: isLoadingAvailable } =
    api.nft.available.useQuery();

  const createDeliveryMutation = api.delivery.create.useMutation({
    onSuccess: () => {
      void utils.delivery.my.invalidate();
    },
  });

  useEffect(() => {
    if (state.stage !== DeliveryStage.LIST) {
      setState((prev) => ({ ...prev, isLoading: true }));
      const timer = setTimeout(() => {
        setState((prev) => ({ ...prev, isLoading: false }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.stage]);

  const setStage = (newStage: DeliveryStage) => {
    setState((prev) => ({ ...prev, stage: newStage }));
  };

  const handleBack = () => {
    setState((prev) => {
      let newStage: DeliveryStage;
      switch (prev.stage) {
        case DeliveryStage.SELECT:
          newStage = DeliveryStage.LIST;
          break;
        case DeliveryStage.CONFIRM:
          newStage = DeliveryStage.SELECT;
          break;
        case DeliveryStage.FORM:
          newStage = DeliveryStage.CONFIRM;
          break;
        case DeliveryStage.SUCCESS:
          newStage = DeliveryStage.LIST;
          break;
        default:
          newStage = DeliveryStage.LIST;
      }
      return { ...prev, stage: newStage };
    });
  };

  const handleSelect = (nft: TNFT) => {
    setSelectedDeliveryNFT(nft);
    setState((prev) => ({
      ...prev,
      selectedNFT: nft,
      stage: DeliveryStage.CONFIRM,
    }));
  };

  const handleConfirm = () => {
    setState((prev) => ({
      ...prev,
      stage: DeliveryStage.FORM,
    }));
  };

  const handleSubmitForm = async (formData: TDeliveryForm) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      await createDeliveryMutation.mutateAsync({
        ...formData,
        lockDate: 4,
        nftId: state.selectedNFT?.id ?? "",
      });

      setState((prev) => ({
        ...prev,
        stage: DeliveryStage.SUCCESS,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to submit form",
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return {
    state: {
      ...state,
      isLoading: state.isLoading || isLoadingDeliveries || isLoadingAvailable,
    },
    actions: {
      handleBack,
      handleSelect,
      handleConfirm,
      handleSubmitForm,
      setStage,
    },
    queries: {
      deliveryNFTs: deliveryNFTs ?? [],
      availableNFTs: availableNFTs ?? [],
      isLoading: isLoadingDeliveries || isLoadingAvailable,
      error: state.error,
    },
  };
}
