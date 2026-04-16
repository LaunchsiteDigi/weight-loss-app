"use client";

import {
  ScaleIcon,
  UtensilsIcon,
  GlassWaterIcon,
  DumbbellIcon,
  MoonIcon,
  RulerIcon,
  TrendingDownIcon,
  TargetIcon,
  CalendarIcon,
  CalculatorIcon,
  MessageSquareIcon,
  PenSquareIcon,
  Trash2Icon,
  PaletteIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type SlashCommand = {
  name: string;
  description: string;
  icon: ReactNode;
  action: string;
  prompt?: string;
  category?: string;
};

export const slashCommands: SlashCommand[] = [
  // Tracking
  {
    name: "weight",
    description: "Log your weight",
    icon: <ScaleIcon className="size-3.5" />,
    action: "prompt",
    prompt: "I want to log my weight today",
    category: "Tracking",
  },
  {
    name: "calories",
    description: "Log calorie intake",
    icon: <UtensilsIcon className="size-3.5" />,
    action: "prompt",
    prompt: "I want to log what I ate. Help me track the calories.",
    category: "Tracking",
  },
  {
    name: "water",
    description: "Log water intake",
    icon: <GlassWaterIcon className="size-3.5" />,
    action: "prompt",
    prompt: "I want to log my water intake today",
    category: "Tracking",
  },
  {
    name: "workout",
    description: "Log exercise session",
    icon: <DumbbellIcon className="size-3.5" />,
    action: "prompt",
    prompt: "I want to log a workout I just did",
    category: "Tracking",
  },
  {
    name: "sleep",
    description: "Log sleep hours",
    icon: <MoonIcon className="size-3.5" />,
    action: "prompt",
    prompt: "I want to log how I slept last night",
    category: "Tracking",
  },
  {
    name: "measure",
    description: "Log body measurements",
    icon: <RulerIcon className="size-3.5" />,
    action: "prompt",
    prompt: "I want to log my body measurements",
    category: "Tracking",
  },
  // Goals & Progress
  {
    name: "progress",
    description: "View your progress",
    icon: <TrendingDownIcon className="size-3.5" />,
    action: "prompt",
    prompt: "Show me my weight loss progress and stats",
    category: "Progress",
  },
  {
    name: "goal",
    description: "Set a weight goal",
    icon: <TargetIcon className="size-3.5" />,
    action: "prompt",
    prompt: "I want to set a new weight loss goal",
    category: "Progress",
  },
  {
    name: "bmi",
    description: "Calculate your BMI",
    icon: <CalculatorIcon className="size-3.5" />,
    action: "prompt",
    prompt: "Calculate my BMI",
    category: "Progress",
  },
  {
    name: "checkin",
    description: "Daily check-in",
    icon: <CalendarIcon className="size-3.5" />,
    action: "prompt",
    prompt: "Let's do my daily check-in - meals, exercise, water, and mood",
    category: "Progress",
  },
  // Coaching
  {
    name: "meals",
    description: "Get meal suggestions",
    icon: <UtensilsIcon className="size-3.5" />,
    action: "prompt",
    prompt: "Suggest some healthy meals for today based on my goals",
    category: "Coaching",
  },
  {
    name: "motivate",
    description: "Send motivation via iMessage",
    icon: <MessageSquareIcon className="size-3.5" />,
    action: "prompt",
    prompt: "Send me a motivational message via iMessage",
    category: "Coaching",
  },
  // System
  {
    name: "new",
    description: "Start new chat",
    icon: <PenSquareIcon className="size-3.5" />,
    action: "new",
    category: "System",
  },
  {
    name: "theme",
    description: "Toggle dark/light",
    icon: <PaletteIcon className="size-3.5" />,
    action: "theme",
    category: "System",
  },
  {
    name: "clear",
    description: "Clear chat",
    icon: <Trash2Icon className="size-3.5" />,
    action: "clear",
    category: "System",
  },
];

type SlashCommandMenuProps = {
  query: string;
  onSelect: (command: SlashCommand) => void;
  onClose: () => void;
  selectedIndex: number;
};

export function SlashCommandMenu({
  query,
  onSelect,
  onClose: _onClose,
  selectedIndex,
}: SlashCommandMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const filtered = slashCommands.filter((cmd) =>
    cmd.name.startsWith(query.toLowerCase())
  );

  useEffect(() => {
    const selected = menuRef.current?.querySelector("[data-selected='true']");
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (filtered.length === 0) {
    return null;
  }

  // Group by category
  const groups: Record<string, SlashCommand[]> = {};
  for (const cmd of filtered) {
    const cat = cmd.category ?? "Other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(cmd);
  }

  let globalIndex = 0;

  return (
    <div
      className="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-xl border border-border/50 bg-card/95 shadow-[var(--shadow-float)] backdrop-blur-xl"
      ref={menuRef}
    >
      <div className="max-h-80 overflow-y-auto py-1 no-scrollbar">
        {Object.entries(groups).map(([category, cmds]) => (
          <div key={category}>
            <div className="px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
              {category}
            </div>
            {cmds.map((cmd) => {
              const index = globalIndex++;
              return (
                <button
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2 text-left transition-colors",
                    index === selectedIndex
                      ? "bg-primary/10 text-foreground"
                      : "hover:bg-muted/40"
                  )}
                  data-selected={index === selectedIndex}
                  key={cmd.name}
                  onClick={() => onSelect(cmd)}
                  onMouseDown={(e) => e.preventDefault()}
                  type="button"
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground/60">
                    {cmd.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-medium">
                      /{cmd.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground/50">
                      {cmd.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
