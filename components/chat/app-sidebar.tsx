"use client";

import {
  CalendarIcon,
  DumbbellIcon,
  LinkIcon,
  MessageSquareIcon,
  PanelLeftIcon,
  PenSquareIcon,
  SettingsIcon,
  ScaleIcon,
  TargetIcon,
  TrendingDownIcon,
  TrashIcon,
  UtensilsIcon,
  GlassWaterIcon,
  MoonIcon,
  RulerIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "next-auth";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import {
  getChatHistoryPaginationKey,
  SidebarHistory,
} from "@/components/chat/sidebar-history";
import { SidebarUserNav } from "@/components/chat/sidebar-user-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

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

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile, toggleSidebar } = useSidebar();
  const { mutate } = useSWRConfig();
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);

  const handleDeleteAll = () => {
    setShowDeleteAllDialog(false);
    router.replace("/");
    mutate(unstable_serialize(getChatHistoryPaginationKey), [], {
      revalidate: false,
    });

    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/history`, {
      method: "DELETE",
    });

    toast.success("All chats deleted");
  };

  const handleQuickAction = (prompt: string) => {
    setOpenMobile(false);
    // Set the prompt into the chat input via a custom event
    window.dispatchEvent(
      new CustomEvent("coach-quick-action", { detail: { prompt } })
    );
    // Navigate to home if not already there
    if (pathname !== "/") {
      router.push("/");
    }
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="pb-0 pt-3">
          <SidebarMenu>
            <SidebarMenuItem className="flex flex-row items-center justify-between">
              <div className="group/logo relative flex items-center justify-center">
                <SidebarMenuButton
                  asChild
                  className="size-8 !px-0 items-center justify-center group-data-[collapsible=icon]:group-hover/logo:opacity-0"
                  tooltip="Coach"
                >
                  <Link href="/" onClick={() => setOpenMobile(false)}>
                    <ScaleIcon className="size-4 text-sidebar-foreground/50" />
                  </Link>
                </SidebarMenuButton>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      className="pointer-events-none absolute inset-0 size-8 opacity-0 group-data-[collapsible=icon]:pointer-events-auto group-data-[collapsible=icon]:group-hover/logo:opacity-100"
                      onClick={() => toggleSidebar()}
                    >
                      <PanelLeftIcon className="size-4" />
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent className="hidden md:block" side="right">
                    Open sidebar
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="group-data-[collapsible=icon]:hidden">
                <SidebarTrigger className="text-sidebar-foreground/60 transition-colors duration-150 hover:text-sidebar-foreground" />
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {/* New Chat */}
          <SidebarGroup className="pt-1">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="h-8 rounded-lg border border-sidebar-border text-[13px] text-sidebar-foreground/70 transition-colors duration-150 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    onClick={() => {
                      setOpenMobile(false);
                      router.push("/");
                    }}
                    tooltip="New Chat"
                  >
                    <PenSquareIcon className="size-4" />
                    <span className="font-medium">New chat</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Tracking */}
          {user && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-foreground/40">
                Tracking
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {trackingItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        className="h-7 rounded-lg text-[13px] text-sidebar-foreground/60 transition-colors duration-150 hover:text-sidebar-foreground"
                        onClick={() => handleQuickAction(item.prompt)}
                        tooltip={item.label}
                      >
                        <item.icon className="size-3.5" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Schedule */}
          {user && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-foreground/40">
                Schedule
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {scheduleItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        className="h-7 rounded-lg text-[13px] text-sidebar-foreground/60 transition-colors duration-150 hover:text-sidebar-foreground"
                        onClick={() => handleQuickAction(item.prompt)}
                        tooltip={item.label}
                      >
                        <item.icon className="size-3.5" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Integrations */}
          {user && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-foreground/40">
                Integrations
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className="h-7 rounded-lg text-[13px] text-sidebar-foreground/60 transition-colors duration-150 hover:text-sidebar-foreground"
                      onClick={() => handleQuickAction("Send me a motivational iMessage")}
                      tooltip="iMessage"
                    >
                      <MessageSquareIcon className="size-3.5" />
                      <span>iMessage Coach</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className="h-7 rounded-lg text-[13px] text-sidebar-foreground/60 transition-colors duration-150 hover:text-sidebar-foreground"
                      tooltip="Connections"
                    >
                      <Link
                        href="/settings"
                        onClick={() => setOpenMobile(false)}
                      >
                        <LinkIcon className="size-3.5" />
                        <span>Connections</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Settings */}
          {user && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-foreground/40">
                Settings
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={`h-7 rounded-lg text-[13px] transition-colors duration-150 ${
                        pathname === "/settings"
                          ? "text-sidebar-foreground bg-sidebar-accent/50"
                          : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                      }`}
                      tooltip="Settings"
                    >
                      <Link
                        href="/settings"
                        onClick={() => setOpenMobile(false)}
                      >
                        <SettingsIcon className="size-3.5" />
                        <span>Profile & Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className="h-7 rounded-lg text-[13px] text-sidebar-foreground/40 transition-colors duration-150 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setShowDeleteAllDialog(true)}
                      tooltip="Delete All Chats"
                    >
                      <TrashIcon className="size-3.5" />
                      <span>Delete all chats</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Chat History */}
          <SidebarHistory user={user} />
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border pt-2 pb-3">
          {user && <SidebarUserNav user={user} />}
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <AlertDialog
        onOpenChange={setShowDeleteAllDialog}
        open={showDeleteAllDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all chats?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all
              your chats and remove them from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll}>
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
