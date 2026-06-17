"use client";

import { BackgroundGradient } from "@/components/app/background-gradient";
import { AppSidebar } from "@/components/app/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="relative h-screen min-h-0 overflow-hidden bg-transparent">
      <BackgroundGradient />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        跳到主要内容
      </a>
      <AppSidebar />
      <SidebarInset className="relative z-10 min-h-0 bg-transparent pt-[60px] md:pt-0">
        <header className="topbar-glass fixed left-0 right-0 top-0 z-30 flex h-[60px] shrink-0 items-center gap-3 border-b border-border/40 px-4 md:sticky md:left-auto md:px-6">
          <SidebarTrigger className="-ml-1 h-8 w-8 text-muted-foreground hover:bg-accent/40 hover:text-foreground" />
          <div className="h-5 w-px bg-border/60" aria-hidden />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              Personal Hub
            </p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              你的轻量个人服务入口
            </p>
          </div>
        </header>
        <main
          id="main-content"
          className="flex-1 overflow-y-auto"
        >
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
