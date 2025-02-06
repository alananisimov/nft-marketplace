import type { ReactNode } from "react";

import { Toaster } from "@acme/ui/toast";

import { TelegramProvider } from "../telegram-provider";
import { TRPCReactProvider } from "../trpc-provider/react";
import { Animate, Transitions } from "./transitions";

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <TRPCReactProvider>
      <Transitions>
        <Animate>
          <Toaster position="top-center" />
          <TelegramProvider>{children}</TelegramProvider>
        </Animate>
      </Transitions>
    </TRPCReactProvider>
  );
}
