import type { ReactNode } from "react";
import { ProfileHeader } from "~/features/profile/ui/profile-header";

import { BackButton } from "~/shared/ui/back-button";

function ProfileBackButton() {
  return <BackButton className="absolute left-6 top-12 z-50" />;
}

interface ProfileLayoutProps {
  children: ReactNode;
}

export function ProfileLayout({ children }: ProfileLayoutProps) {
  return (
    <div className="relative flex flex-col">
      <ProfileBackButton />
      <ProfileHeader />
      {children}
    </div>
  );
}
