import type { Metadata } from "next";

import { cn } from "@acme/ui";

import "~/app/styles/globals.css";

import type { ReactNode } from "react";

import { H1 } from "@acme/ui/typography";

import { RootProviders } from "~/app/providers/root-provider";
import { poppins } from "~/fonts/poppins";

export const metadata: Metadata = {
  title: "NFT Marketplace",
  description: "Buy/Sell your crypto",
  openGraph: {
    title: "NFT Marketplace",
    description: "Simple monorepo with shared backend for web & mobile apps",
    url: "https://create-t3-turbo.vercel.app",
    siteName: "NFT Marketplace",
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "relative min-h-screen bg-background font-sans text-foreground antialiased",
          poppins.className,
        )}
      >
        <RootProviders>
          <div className="md:hidden">{children}</div>
        </RootProviders>
        <div className="hidden h-screen md:block">
          <H1 className="absolute left-1/2 top-1/2 hidden translate-x-[-50%] translate-y-[-50%] md:block">
            Please use this app only in telegram
          </H1>
        </div>
      </body>
    </html>
  );
}
