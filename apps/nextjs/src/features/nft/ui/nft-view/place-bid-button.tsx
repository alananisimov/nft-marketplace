"use client";

import { postEvent } from "@telegram-apps/sdk-react";

import { Button } from "@acme/ui/button";

interface PlaceBidButtonProps {
  marketLink: string;
}

export function PlaceBidButton({ marketLink }: PlaceBidButtonProps) {
  return (
    <Button
      onClick={() => {
        postEvent("web_app_open_link", {
          url: marketLink,
        });
      }}
      size="md"
      variant="primary"
    >
      Place Bid
    </Button>
  );
}
