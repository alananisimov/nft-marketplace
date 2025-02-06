"use client";

import { useState } from "react";
import { CheckIcon, ClipboardIcon } from "lucide-react";

import { Button } from "@acme/ui/button";
import { DefaultInput } from "@acme/ui/input";
import { Label } from "@acme/ui/label";

import type { TVerification } from "~/entities/verification/model/verification.types";
import { VerificationStatus } from "~/entities/verification/ui/verification-status";

interface VerificationFormProps {
  verification: TVerification;
  isVerified: boolean;
  onVerificationSuccess?: () => void;
}

export function VerificationForm({
  verification,
  isVerified,
}: VerificationFormProps) {
  const [copied, setCopied] = useState<"wallet" | "memo" | null>(null);

  const copyToClipboard = async (text: string, type: "wallet" | "memo") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Wallet Address</Label>
        <div className="relative">
          <DefaultInput
            readOnly
            value={verification.walletAddress}
            className="pr-10"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() =>
              copyToClipboard(verification.walletAddress, "wallet")
            }
          >
            {copied === "wallet" ? (
              <CheckIcon className="h-4 w-4 text-green-500" />
            ) : (
              <ClipboardIcon className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Memo</Label>
        <div className="relative">
          <DefaultInput readOnly value={verification.memo} className="pr-10" />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => copyToClipboard(verification.memo, "memo")}
          >
            {copied === "memo" ? (
              <CheckIcon className="h-4 w-4 text-green-500" />
            ) : (
              <ClipboardIcon className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex justify-center py-2">
        <VerificationStatus isVerified={isVerified} />
      </div>
    </div>
  );
}
