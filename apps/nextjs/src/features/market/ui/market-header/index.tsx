"use client";

import { useTelegramData } from "~/shared/hooks/use-tg-data";

import { Icons } from "~/shared/ui/icons";
import { UserBalance } from "./user-balance";
import type { AuthSession } from "@acme/auth";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";

export function MarketHeader({ session }: { session: AuthSession | null }) {
  const auth = useTelegramData();
  return (
    <div className="flex h-[92px] w-full items-center pr-6">
      <div className="inline-flex h-12 flex-1 justify-between">
        <div className="inline-flex items-center justify-center gap-x-2 rounded-sm bg-white px-3 py-2">
          <Icons.stellar_mono className="size-[18px]" />
          {session && <UserBalance />}
        </div>
        <Link href={"/me"}>
          <Avatar className="size-12 border-2 border-[#BFBFBF]">
            <AvatarFallback />
            <AvatarImage
              src={auth?.user.photoUrl ?? "/avatar.png"}
              width={64}
              height={64}
              className=""
            />
          </Avatar>
        </Link>
      </div>
    </div>
  );
}
