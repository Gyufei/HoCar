"use client";

import { AppSidebar } from "@/components/app/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        跳到主要内容
      </a>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <SidebarTrigger />
          <div className="h-5 w-px bg-border" aria-hidden />
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
          className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
