import { cn } from "@acme/ui";
import * as React from "react";

import { poppins } from "~/fonts/poppins";

export default function AuthLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div className={cn(poppins.className, "h-screen")}>
      {children}
      {modal}
    </div>
  );
}
