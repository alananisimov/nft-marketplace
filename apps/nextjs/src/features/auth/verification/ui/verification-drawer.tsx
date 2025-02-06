"use client";

import { useEffect, useState } from "react";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@acme/ui/drawer";

import { ClockCountdown } from "~/entities/verification/ui/clock-countdown";
import { LoadingSpinner } from "~/shared/ui/loading-spinner";
import { useVerificationState } from "../api/use-verification-state";
import { VerificationForm } from "./verification-form";

interface VerificationDrawerProps {
  publicKey: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function VerificationDrawerWrapper({
  publicKey,
}: {
  publicKey: string;
}) {
  const [open, setOpen] = useState(true);
  return (
    <VerificationDrawer publicKey={publicKey} open={open} setOpen={setOpen} />
  );
}

export function VerificationDrawer({
  publicKey,
  open,
  setOpen,
}: VerificationDrawerProps) {
  const { state, verification, isLoading, createVerification, handleClose } =
    useVerificationState(publicKey);

  useEffect(() => {
    void createVerification();
  }, [createVerification]);

  useEffect(() => {
    if (state.status === "completed") {
      setOpen(false);
    }
  }, [state.status, setOpen]);

  const isVerified =
    state.status === "completed" ||
    state.status === "linking_telegram" ||
    state.status === "logging_in";

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          handleClose();
        }
      }}
    >
      <DrawerContent className="p-4 sm:max-w-[425px]">
        <DrawerHeader>
          <DrawerTitle>Wallet Verification</DrawerTitle>
        </DrawerHeader>

        {/* <button
          onClick={() => {
            router.push("/");
            router.refresh();
            setOpen(false);
          }}
        >
          Test Navigation
        </button>  */}

        {isLoading ? (
          <div className="flex justify-center p-4">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            <VerificationInstructions />

            {verification && (
              <>
                <VerificationForm
                  verification={verification}
                  isVerified={isVerified}
                />
                <ClockCountdown
                  expiresAt={verification.expiresAt}
                  isVerified={isVerified}
                />
              </>
            )}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function VerificationInstructions() {
  return (
    <div className="text-sm text-muted-foreground">
      <p>Please send 1 XLM to verify your account.</p>
      <p className="mt-1 text-xs">Your funds will be returned.</p>
    </div>
  );
}
