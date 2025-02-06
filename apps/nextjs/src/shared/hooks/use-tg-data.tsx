"use client";

import { useInitDataRaw } from "@telegram-apps/sdk-react";

export function useTelegramData() {
  const initData = useInitDataRaw(false);
  if (!initData.result?.user?.id) {
    return;
  }
  return { token: initData.result.hash, user: initData.result.user, full: initData.result};
}
