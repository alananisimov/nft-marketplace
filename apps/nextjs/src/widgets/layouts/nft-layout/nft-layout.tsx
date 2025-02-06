import type { ReactNode } from "react";

export function NFTLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col gap-y-5 bg-white py-12 pl-6 pr-4">
      {children}
    </main>
  );
}
