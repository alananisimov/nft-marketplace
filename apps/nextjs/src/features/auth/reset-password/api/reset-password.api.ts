"use client";

import { useState } from "react";

import { api } from "~/app/providers/trpc-provider/react";
import type { TVerification } from "~/entities/verification/model/verification.types";
import { useTelegramData } from "~/shared/hooks/use-tg-data";

interface UseResetPasswordApiProps {
  onError?: (error: Error | string) => void;
}

export function useResetPasswordApi({
  onError,
}: UseResetPasswordApiProps = {}) {
  const auth = useTelegramData();
  const [verification, setVerification] = useState<TVerification | null>(null);

  const createVerificationMutation = api.verification.create.useMutation({
    onError: (e) => {
      onError?.(e.message);
    },
  });

  const { data: verificationStatus } = api.verification.checkStatus.useQuery(
    {
      verificationId: verification?.id ?? "",
    },
    {
      enabled: !!verification?.id,
      refetchInterval: (query) => {
        if (query.state.data?.isVerified) {
          return false;
        }
        return 2000;
      },
    },
  );

  const createVerification = async () => {
    const verification = await createVerificationMutation.mutateAsync({
      telegramId: auth?.user.id ?? 0,
    });
    setVerification(verification);
    return verification;
  };

  return {
    createVerification,
    verification,
    verificationStatus,
    isLoading: createVerificationMutation.isPending,
  };
}
