"use client";

import type { PropsWithChildren } from "react";
import { SDKProvider, useLaunchParams } from "@telegram-apps/sdk-react";
import { Loader2Icon } from "lucide-react";

import { env } from "~/app/config/env";
import { useDidMount } from "~/shared/hooks/use-did-mount";
import { useTelegramMock } from "~/shared/hooks/use-telegram-mock";

function TelegramProviderInner(props: PropsWithChildren) {
  if (env.NODE_ENV === "development") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useTelegramMock();
  }

  const debug = useLaunchParams().startParam === "debug";
  // @ts-expect-error Telegram sdk not updated to react19 types yet
  return <SDKProvider debug={debug}>{props.children}</SDKProvider>;
}

export function TelegramProvider(props: PropsWithChildren) {
  // Unfortunately, Telegram Mini Apps does not allow us to use all features of the Server Side
  // Rendering. That's why we are showing loader on the server side.
  const didMount = useDidMount();

  return didMount ? (
    <TelegramProviderInner>{props.children}</TelegramProviderInner>
  ) : (
    <div className="relative h-dvh w-screen">
      <Loader />
    </div>
  );
}

function Loader() {
  return (
    <div className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%]">
      <Loader2Icon className="size-8 animate-spin" />
    </div>
  );
}
