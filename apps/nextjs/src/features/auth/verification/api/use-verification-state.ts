"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { toast } from "sonner";

import type {
  TVerification,
  VerificationState,
} from "../model/verification.types";
import { api } from "~/app/providers/trpc-provider/react";
import { useTelegramData } from "~/shared/hooks/use-tg-data";
import { useLoginApi } from "../../login/api/login.api";
import { loginState } from "../../login/state/login-state";

export function useVerificationState(publicKey: string) {
  const router = useRouter();
  const [state, setState] = useState<VerificationState>({ status: "idle" });
  const [verification, setVerification] = useState<TVerification | null>(null);
  const telegramData = useTelegramData();
  const loginData = useAtomValue(loginState);
  const { login } = useLoginApi();

  const createVerificationMutation = api.verification.create.useMutation({
    onError: (error) => {
      setState({ status: "error", error: error.message });
      toast.error("Failed to create verification");
    },
  });

  const verifyNewTelegramIdMutation =
    api.verification.verifyNewTelegramId.useMutation({
      onSuccess: () => {
        if (!loginData) {
          setState({ status: "completed" });
          return;
        }
        void handleLogin();
      },
      onError: (error) => {
        setState({ status: "error", error: error.message });
        toast.error("Failed to verify Telegram ID");
      },
    });

  const { data: verificationStatus } = api.verification.checkStatus.useQuery(
    {
      verificationId: verification?.id ?? "",
    },
    {
      enabled: state.status === "awaiting_payment" && !!verification?.id,
      refetchInterval: 2000,
    },
  );

  const handleLogin = useCallback(async () => {
    try {
      setState({ status: "logging_in" });
      const success = await login(
        {
          stellar_key: loginData?.stellarKey ?? "",
          password: loginData?.password ?? "",
        },
        {
          redirect: false,
          onSuccess: () => {
            setState({ status: "completed" });
            toast.success("Verification successful");
            router.push("/");
          },
          onError: (error) => {
            setState({ status: "error", error: String(error) });
            toast.error("Login failed", { description: String(error) });
          },
        },
      );

      if (!success) {
        setState({ status: "error", error: "Login failed" });
      }
    } catch (error) {
      setState({
        status: "error",
        error: error instanceof Error ? error.message : "Login failed",
      });
    }
  }, [login, loginData, router]);

  const handleVerificationSuccess = useCallback(async () => {
    if (!verification?.id || !telegramData?.user.id) {
      return;
    }

    try {
      setState({ status: "linking_telegram" });
      await verifyNewTelegramIdMutation.mutateAsync({
        telegramId: telegramData.user.id,
        publicKey,
        verificationId: verification.id,
      });
    } catch (error) {
      setState({
        status: "error",
        error: error instanceof Error ? error.message : "Verification failed",
      });
    }
  }, [
    verification?.id,
    telegramData?.user.id,
    publicKey,
    verifyNewTelegramIdMutation,
  ]);

  const createVerification = useCallback(async () => {
    if (state.status !== "idle") return;

    try {
      setState({ status: "creating" });
      const newVerification = await createVerificationMutation.mutateAsync({
        publicKey,
      });
      setVerification(newVerification);
      setState({ status: "awaiting_payment", verification: newVerification });
    } catch (error) {
      setState({
        status: "error",
        error:
          error instanceof Error
            ? error.message
            : "Failed to create verification",
      });
    }
  }, [publicKey, createVerificationMutation, state.status]);

  useEffect(() => {
    if (verificationStatus?.isVerified && state.status === "awaiting_payment") {
      void handleVerificationSuccess();
    }
  }, [verificationStatus?.isVerified, state.status, handleVerificationSuccess]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const isLoading =
    state.status === "creating" ||
    state.status === "linking_telegram" ||
    state.status === "logging_in";

  return {
    state,
    verification,
    isLoading,
    createVerification,
    handleVerificationSuccess,
    handleClose,
  };
}
