"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type {
  PasswordFormData,
  RecoveryStep,
  StellarKeyFormData,
} from "../reset-password.types";
import { api } from "~/app/providers/trpc-provider/react";
import { useResetPasswordApi } from "../../api/reset-password.api";

interface UseResetPasswordProps {
  onSuccess?: () => void;
}

export function useResetPassword({ onSuccess }: UseResetPasswordProps = {}) {
  const router = useRouter();
  const [step, setStep] = useState<RecoveryStep>("stellar-key");
  const [stellarKey, setStellarKey] = useState<string | null>(null);

  const { createVerification, verification, verificationStatus, isLoading } =
    useResetPasswordApi({
      onError: (error) => {
        toast.error("Error creating verification", {
          description: typeof error === "string" ? error : error.message,
        });
      },
    });

  const resetPasswordMutation = api.verification.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("Password updated successfully", {
        description: "You can now login with your new password",
      });
      router.push("/login");
    },
  });

  const handleStellarKeySubmit = async (data: StellarKeyFormData) => {
    setStellarKey(data.stellarKey);
    await createVerification();
    setStep("verification");
  };

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    if (!verification?.id || !stellarKey) return;

    try {
      const result = await resetPasswordMutation.mutateAsync({
        publicKey: stellarKey,
        verificationId: verification.id,
        newPassword: data.password,
      });

      if (result.success) {
        onSuccess?.();
      }
    } catch (error) {
      toast.error("Error updating password", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  useEffect(() => {
    if (verificationStatus?.isVerified && step === "verification") {
      setStep("new-password");
      toast.info("Verification successful", {
        description: "Please set your new password",
      });
    }
  }, [verificationStatus?.isVerified, step]);

  return {
    step,
    verification,
    verificationStatus,
    isLoading,
    handleStellarKeySubmit,
    handlePasswordSubmit,
  };
}
