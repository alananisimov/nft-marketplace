import type { ReactNode } from "react";

export function CollectionsLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex h-screen flex-col gap-y-5 bg-white py-12 pl-6 pr-4">
      {children}
    </main>
  );
}
