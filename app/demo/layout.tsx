import Script from "next/script";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { DataStreamProvider } from "@/components/chat/data-stream-provider";
import { ChatShell } from "@/components/chat/shell";
import { ActiveChatProvider } from "@/hooks/use-active-chat";
import { auth } from "../(auth)/auth";
import { DemoShell } from "./demo-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="lazyOnload"
      />
      <DataStreamProvider>
        <Suspense fallback={<div className="flex h-dvh bg-background" />}>
          <DemoContent>{children}</DemoContent>
        </Suspense>
      </DataStreamProvider>
    </>
  );
}

async function DemoContent({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <DemoShell user={session?.user}>
      <Toaster
        position="top-center"
        theme="system"
        toastOptions={{
          className:
            "!bg-card !text-foreground !border-border/50 !shadow-[var(--shadow-float)]",
        }}
      />
      <Suspense fallback={<div className="flex h-dvh" />}>
        <ActiveChatProvider>
          <ChatShell />
        </ActiveChatProvider>
      </Suspense>
      {children}
    </DemoShell>
  );
}
