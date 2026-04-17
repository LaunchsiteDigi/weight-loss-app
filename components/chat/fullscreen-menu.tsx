"use client";

import {
  CalendarIcon,
  DumbbellIcon,
  GlassWaterIcon,
  LinkIcon,
  MenuIcon,
  MessageSquareIcon,
  MoonIcon,
  PenSquareIcon,
  RulerIcon,
  ScaleIcon,
  SettingsIcon,
  TargetIcon,
  TrashIcon,
  TrendingDownIcon,
  UtensilsIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "next-auth";
import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { getChatHistoryPaginationKey } from "@/components/chat/sidebar-history";

const trackingItems = [
  { label: "Log Weight", icon: ScaleIcon, prompt: "I want to log my weight" },
  { label: "Log Calories", icon: UtensilsIcon, prompt: "I want to log what I ate" },
  { label: "Log Water", icon: GlassWaterIcon, prompt: "I want to log my water intake" },
  { label: "Log Workout", icon: DumbbellIcon, prompt: "I want to log a workout" },
  { label: "Log Sleep", icon: MoonIcon, prompt: "I want to log my sleep" },
  { label: "Measurements", icon: RulerIcon, prompt: "I want to log my body measurements" },
];

const scheduleItems = [
  { label: "View Progress", icon: TrendingDownIcon, prompt: "Show me my progress" },
  { label: "Set Goal", icon: TargetIcon, prompt: "I want to set a weight loss goal" },
  { label: "Meal Ideas", icon: UtensilsIcon, prompt: "Suggest healthy meals for today" },
  { label: "Daily Check-in", icon: CalendarIcon, prompt: "Let's do my daily check-in" },
];

export function useFullscreenMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((o) => !o), []);
  return { isOpen, open, close, toggle };
}

export function MenuTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-xl text-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
      type="button"
    >
      <MenuIcon className="size-5" />
    </button>
  );
}

type FullscreenMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  user: User | undefined;
};

export function FullscreenMenu({ isOpen, onClose, user }: FullscreenMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { mutate } = useSWRConfig();

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleQuickAction = (prompt: string) => {
    onClose();
    window.dispatchEvent(
      new CustomEvent("coach-quick-action", { detail: { prompt } })
    );
    if (pathname !== "/demo") {
      router.push("/demo");
    }
  };

  const handleNav = (href: string) => {
    onClose();
    router.push(href);
  };

  const handleDeleteAll = () => {
    onClose();
    router.replace("/demo");
    mutate(unstable_serialize(getChatHistoryPaginationKey), [], {
      revalidate: false,
    });
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/history`, {
      method: "DELETE",
    });
    toast.success("All chats deleted");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background/95 backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ScaleIcon className="size-4.5" />
              </div>
              <span className="text-lg font-bold tracking-tight">SlimZero</span>
            </div>
            <button
              onClick={onClose}
              className="flex size-9 items-center justify-center rounded-xl text-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
              type="button"
            >
              <XIcon className="size-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 px-6 pb-8">
            {/* New Chat */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mb-8"
            >
              <button
                onClick={() => handleNav("/demo")}
                className="flex w-full items-center gap-3 rounded-2xl border-2 border-border bg-card px-5 py-4 text-left transition-colors hover:border-primary/30 hover:bg-primary/5"
                type="button"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <PenSquareIcon className="size-4.5" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold">New Chat</p>
                  <p className="text-[12px] text-muted-foreground">Start a conversation with your coach</p>
                </div>
              </button>
            </motion.div>

            {/* Tracking */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                  Tracking
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {trackingItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleQuickAction(item.prompt)}
                      className="flex flex-col items-center gap-2.5 rounded-2xl border border-border/60 bg-card p-4 transition-all hover:border-primary/30 hover:bg-primary/5"
                      type="button"
                    >
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <item.icon className="size-4.5" />
                      </div>
                      <span className="text-[12px] font-semibold text-foreground/70">{item.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Schedule */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-8"
              >
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                  Goals & Progress
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {scheduleItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleQuickAction(item.prompt)}
                      className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5 text-left transition-all hover:border-primary/30 hover:bg-primary/5"
                      type="button"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <item.icon className="size-4" />
                      </div>
                      <span className="text-[13px] font-semibold text-foreground/70">{item.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Integrations & Settings */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                  More
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => handleQuickAction("Send me a motivational iMessage")}
                    className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5 text-left transition-all hover:border-primary/30 hover:bg-primary/5"
                    type="button"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <MessageSquareIcon className="size-4" />
                    </div>
                    <span className="text-[13px] font-semibold text-foreground/70">iMessage Coach</span>
                  </button>

                  <button
                    onClick={() => handleNav("/demo/settings")}
                    className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5 text-left transition-all hover:border-primary/30 hover:bg-primary/5"
                    type="button"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <SettingsIcon className="size-4" />
                    </div>
                    <span className="text-[13px] font-semibold text-foreground/70">Profile & Settings</span>
                  </button>

                  <button
                    onClick={handleDeleteAll}
                    className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5 text-left transition-all hover:border-destructive/30 hover:bg-destructive/5"
                    type="button"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                      <TrashIcon className="size-4" />
                    </div>
                    <span className="text-[13px] font-semibold text-foreground/50">Delete All Chats</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          {user && (
            <div className="border-t border-border/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-primary/10" />
                <div>
                  <p className="text-[13px] font-medium">{user.name ?? user.email}</p>
                  <p className="text-[11px] text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
