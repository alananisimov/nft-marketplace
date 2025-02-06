import type { ReactNode } from "react";

import { CollectionBackButton } from "./collection-back-button";

interface CollectionLayoutProps {
  children: ReactNode;
}

export function CollectionLayout({ children }: CollectionLayoutProps) {
  return (
    <div className="relative flex flex-col">
      <CollectionBackButton />
      {children}
    </div>
  );
}
