"use client";

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { memo, useCallback, useMemo } from "react";
import Link from "next/link";
import { postEvent } from "@telegram-apps/sdk-react";
import { cva } from "class-variance-authority";

import { Button } from "@acme/ui/button";
import { Skeleton } from "@acme/ui/skeleton";
import { H2, H3 } from "@acme/ui/typography";

import type { TNFT } from "../model/nft.types";
import { sfPro } from "~/fonts/sf-pro";
import { Image } from "~/shared/ui/image";
import { useTimeUntil } from "~/shared/hooks/use-time-until";
import { Icons } from "~/shared/ui/icons";
import { cn, formatPrice, getRandomFutureDate } from "~/shared/utils";

const nftCardVariants = cva("relative flex flex-col rounded-[20px] bg-white", {
  variants: {
    size: {
      large:
        "h-[460px] w-full items-center justify-between bg-[#C4C4C4] px-4 py-5",
      medium: "gap-y-4 p-3 drop-shadow-md",
      small: "gap-y-6 rounded-md p-2.5 drop-shadow-sm",
    },
  },
  defaultVariants: {
    size: "medium",
  },
});

interface NFTCardProps
  extends ComponentProps<"div">,
    VariantProps<typeof nftCardVariants> {
  nft: TNFT;
  onImageClick?: () => void;
}

const NFTImage = memo(function NFTImage({
  image,
  name,
  size,
  nftId,
  onClick,
}: {
  image: string;
  name: string;
  size: string;
  nftId: string;
  onClick?: () => void;
}) {
  return (
    <Link href={`/nft/${nftId}`}>
      <Image
        src={image}
        alt={name}
        width={189}
        height={120}
        onClick={onClick}
        loading="eager"
        className={cn("absolute left-0 top-0 h-full w-full object-cover", {
          "rounded-2xl": size === "large",
          "h-[208px] rounded-xl": size === "medium",
          "h-[124px] rounded-md": size === "small",
        })}
      />
    </Link>
  );
});

const BidButton = memo(function BidButton({
  marketLink,
  size,
}: {
  marketLink: string;
  size?: string | null;
}) {
  const handleClick = useCallback(() => {
    postEvent("web_app_open_link", { url: marketLink });
  }, [marketLink]);

  return (
    <Button
      onClick={handleClick}
      size={size == "large" ? "md" : size == "medium" ? "sm" : "esm"}
      variant="primary"
      className={cn({ "w-fit": size === "large" })}
    >
      Place {size === "large" ? "a " : ""}Bid
    </Button>
  );
});

const PriceDisplay = memo(function PriceDisplay({
  currentBid,
  size,
}: {
  currentBid: number;
  size?: string | null;
}) {
  return (
    <div className="flex flex-col">
      <span
        className={cn(
          sfPro.className,
          size === "medium" ? "text-[12px]" : "text-[8px]",
          "text-[#94A3B8]",
        )}
      >
        Current bid
      </span>
      <div className="flex flex-row items-center gap-x-[2px]">
        <Icons.stellar_mono
          className={size === "medium" ? "size-[12px]" : "size-[8px]"}
        />
        <p
          className={cn(
            "font-medium text-primary",
            size === "medium" ? "text-[14px]" : "text-[16px]",
          )}
        >
          {formatPrice(currentBid)}
        </p>
      </div>
    </div>
  );
});

export function NFTCard({
  nft,
  size,
  onImageClick,
  className,
  ...props
}: NFTCardProps) {
  const { name, currentBid, lockupPeriod, image, marketLink, id } = nft;

  const renderLargeCard = () => (
    <>
      <div className="z-10 flex w-full flex-row items-center justify-between rounded-2xl bg-[#FCFCFD] p-4 drop-shadow-lg transition-opacity duration-300 ease-in-out hover:cursor-pointer hover:bg-[#FCFCFD]/90">
        <H2>{name}</H2>
        <span className="text-[16px] font-medium text-[#23262F]">
          {formatPrice(currentBid)} XLM
        </span>
      </div>
      <div className="w-full bg-[#C4C4C4]" />
      <NFTImage
        image={image}
        name={name}
        size={"large"}
        nftId={id}
        onClick={onImageClick}
      />
      <BidButton marketLink={marketLink} size={"large"} />
    </>
  );

  const renderStandardCard = () => (
    <>
      <div className="relative">
        {size === "medium" && (
          <div className="absolute right-2 top-3 z-50 text-nowrap rounded-sm border border-[#1C1D20]/[0.08] bg-[#1C1D20]/35 px-3 py-2 text-xs font-medium text-white">
            <TimeUntil lockupPeriod={lockupPeriod} />
          </div>
        )}
        <div
          className={cn("w-full bg-[#C4C4C4]", {
            "h-[208px] rounded-xl": size === "medium",
            "h-[124px] rounded-md": size === "small",
          })}
        />
        <NFTImage
          image={image}
          name={name}
          size={size ?? ""}
          nftId={id}
          onClick={onImageClick}
        />
      </div>
      <div className="flex flex-col gap-y-3">
        {size === "medium" ? (
          <H3>{name}</H3>
        ) : (
          <h4 className="text-[14px] font-semibold">{name}</h4>
        )}
        <div className="flex flex-row items-center justify-between">
          <PriceDisplay currentBid={currentBid} size={size} />
          <BidButton marketLink={marketLink} size={size} />
        </div>
      </div>
    </>
  );

  return (
    <div className={cn(nftCardVariants({ size }), className)} {...props}>
      {size === "large" ? renderLargeCard() : renderStandardCard()}
    </div>
  );
}

const TimeUntil = memo(function ({ lockupPeriod }: { lockupPeriod: number }) {
  const now = new Date();
  const randomDate = useMemo(
    () => getRandomFutureDate(now, lockupPeriod + 24),
    [],
  );
  const timeLeft = useTimeUntil(randomDate);
  return <>{timeLeft}</>;
});

export function NFTCardSkeleton() {
  return (
    <div className="flex w-[70%] flex-col gap-y-4 rounded-[20px] bg-white p-3 drop-shadow-md">
      <div className="relative">
        <Skeleton className="h-[208px] w-full rounded-xl" />
        <div className="absolute right-2 top-3 z-50">
          <Skeleton className="h-8 w-24 rounded-sm" />
        </div>
      </div>
      <div className="flex flex-col gap-y-3">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
}
