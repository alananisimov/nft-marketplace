"use client";

import { useTelegramData } from "~/shared/hooks/use-tg-data";
import { ProfileBackground } from "./profile-background";
import { ProfileInfo } from "./profile-info";

export function ProfileHeader() {
  const session = useTelegramData();

  return (
    <>
      <ProfileBackground />
      {session && <ProfileInfo profile={session.user} />}
    </>
  );
}
