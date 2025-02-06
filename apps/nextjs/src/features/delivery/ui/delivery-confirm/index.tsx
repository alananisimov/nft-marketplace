"use client";

import { useState } from "react";

import { Avatar, AvatarFallback } from "@acme/ui/avatar";
import { Button } from "@acme/ui/button";
import { Checkbox } from "@acme/ui/checkbox";

import type { TNFT } from "~/entities/nft/model/nft.types";
import { Image } from "~/shared/ui/image";

interface DeliveryConfirmProps {
  nft?: TNFT;
  onConfirm: () => void;
}

function DeliveryConfirm({ nft, onConfirm }: DeliveryConfirmProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleConfirm = () => {
    if (!isChecked) {
      setError("You must accept rules of out service");
      return;
    }
    onConfirm();
  };

  return (
    <div className="flex flex-col gap-y-8 p-4">
      <div className="flow-row mx-auto mt-4 flex items-center gap-x-[9px]">
        <Avatar>
          <AvatarFallback />
          <Image
            src={nft?.image ?? ""}
            alt={nft?.name ?? ""}
            height={64}
            width={64}
            className="aspect-square h-full w-full"
          />
        </Avatar>
        <div className="flex flex-col justify-between text-left">
          <span className="text-[16px] font-medium">{nft?.name}</span>
          <p className="text-muted-foreground">{nft?.description}</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            onCheckedChange={() => setIsChecked((v) => !v)}
            checked={isChecked}
          />
          <label
            htmlFor="terms"
            className="text-[9px] font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            You are accept all rules accept all rules
          </label>
        </div>

        {error && <span className="text-[9px] text-destructive">{error}</span>}

        <Button
          size="light"
          variant="light"
          className="w-full"
          onClick={handleConfirm}
        >
          Confirm
        </Button>
      </div>
    </div>
  );
}

export { DeliveryConfirm };
