"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@acme/ui/drawer";

import { ClockCountdown } from "~/entities/verification/ui/clock-countdown";
import { VerificationForm } from "~/features/auth/verification/ui/verification-form";
import { useResetPassword } from "../../model/hooks/use-reset-password";
import { NewPasswordForm } from "../reset-password-form/new-password-form";
import { StellarKeyForm } from "../reset-password-form/stellar-key-form";

export function PasswordResetDrawer() {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const {
    step,
    verification,
    verificationStatus,
    isLoading,
    handleStellarKeySubmit,
    handlePasswordSubmit,
  } = useResetPassword({
    onSuccess: () => {
      setOpen(false);
      router.push("/login");
    },
  });

  return (
    <Drawer
      open={open}
      onOpenChange={() => {
        setOpen((open) => !open);
        router.back();
      }}
    >
      <DrawerContent className="p-4">
        <DrawerHeader>
          <DrawerTitle>Account Recovery</DrawerTitle>
        </DrawerHeader>

        <div className="space-y-6 pt-4">
          {step === "stellar-key" && (
            <StellarKeyForm onSubmit={handleStellarKeySubmit} />
          )}

          {step === "verification" && verification && (
            <>
              <div className="text-sm text-muted-foreground">
                <p>Please send 1 XLM to verify your account ownership.</p>
                <p className="mt-1 text-xs">Your funds will be returned.</p>
              </div>
              <VerificationForm
                verification={verification}
                isVerified={verificationStatus?.isVerified}
              />
              <ClockCountdown
                expiresAt={verification.expiresAt}
                isVerified={verificationStatus?.isVerified}
              />
            </>
          )}

          {step === "new-password" && (
            <NewPasswordForm
              onSubmit={handlePasswordSubmit}
              isLoading={isLoading}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
