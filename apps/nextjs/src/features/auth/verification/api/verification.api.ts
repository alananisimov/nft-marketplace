"use client";

import { useEffect, useState } from "react";

import type { TVerification } from "~/entities/verification/model/verification.types";
import { api } from "~/app/providers/trpc-provider/react";
import { useTelegramData } from "~/shared/hooks/use-tg-data";

interface UseVerificationApiProps {
  onSuccess?: () => void;
  onError?: (error: Error | string) => void;
  redirectTo?: string;
  publicKey: string;
}

export function useVerificationApi({
  onSuccess,
  onError,
  publicKey,
}: UseVerificationApiProps) {
  const [verification, setVerification] = useState<TVerification | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const telegramData = useTelegramData();

  const createVerificationMutation = api.verification.create.useMutation({
    onError: (e) => {
      onError?.(e.message);
    },
  });

  const verifyNewTelegramIdMutation =
    api.verification.verifyNewTelegramId.useMutation({
      onError: (e) => {
        onError?.(e.message);
      },
    });

  const createVerification = async () => {
    const verification = await createVerificationMutation.mutateAsync({
      publicKey,
    });
    setVerification(verification);
    return verification;
  };

  const { data: verificationStatus } = api.verification.checkStatus.useQuery(
    {
      verificationId: verification?.id ?? "",
    },
    {
      enabled: !!verification?.id && !isVerified,
      refetchInterval: 2000,
    },
  );

  useEffect(() => {
    console.log("verificationStatus", verificationStatus);
    if (verificationStatus?.isVerified) {
      setIsVerified(true);
    }
  }, [verificationStatus]);

  useEffect(() => {
    console.log("verificationStatus", verificationStatus);
    if (isVerified && verification?.id && telegramData?.user.id) {
      verifyNewTelegramIdMutation.mutate(
        {
          telegramId: telegramData.user.id,
          publicKey,
          verificationId: verification.id,
        },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVerified]);

  setTimeout(() => {
    setIsVerified(true);
  }, 3000);

  return {
    createVerification,
    verification,
    verificationStatus: {
      isVerified: isVerified,
    },
    isLoading:
      createVerificationMutation.isPending ||
      verifyNewTelegramIdMutation.isPending,
  };
}
