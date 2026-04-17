"use client";

import type { User } from "next-auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FullscreenMenu, MenuTrigger, useFullscreenMenu } from "@/components/chat/fullscreen-menu";

export function DemoShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User | undefined;
}) {
  const { isOpen, toggle, close } = useFullscreenMenu();

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="relative flex h-dvh w-full flex-col">
        {/* Top bar */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/50 px-4">
          <MenuTrigger onClick={toggle} />
          <span className="text-[13px] font-semibold tracking-tight text-foreground/70">
            SlimZero
          </span>
          <div className="size-9" />
        </div>

        {/* Chat content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>

        {/* Fullscreen menu overlay */}
        <FullscreenMenu isOpen={isOpen} onClose={close} user={user} />
      </div>
    </SidebarProvider>
  );
}
