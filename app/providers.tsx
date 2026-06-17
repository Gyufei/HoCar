"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </SessionProvider>
  );
}
