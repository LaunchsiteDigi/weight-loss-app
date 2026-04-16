"use client";

import { useRouter } from "next/navigation";
import {
  ScaleIcon,
  UtensilsIcon,
  TrendingDownIcon,
  DumbbellIcon,
  MessageSquareIcon,
  TargetIcon,
} from "lucide-react";

const features = [
  {
    icon: ScaleIcon,
    title: "Track Weight",
    description: "Log daily weigh-ins and see your trend",
  },
  {
    icon: UtensilsIcon,
    title: "Log Meals",
    description: "Track calories and get meal suggestions",
  },
  {
    icon: DumbbellIcon,
    title: "Log Workouts",
    description: "Record exercise with duration and calories",
  },
  {
    icon: TrendingDownIcon,
    title: "View Progress",
    description: "Charts, stats, and goal tracking",
  },
  {
    icon: TargetIcon,
    title: "Set Goals",
    description: "Target weight with timeline tracking",
  },
  {
    icon: MessageSquareIcon,
    title: "iMessage Coach",
    description: "Daily check-ins via text message",
  },
];

export function Preview() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-10 px-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Your AI Weight Loss Coach
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Track weight, meals, workouts, and water intake. Get personalized
          coaching and daily check-ins via iMessage.
        </p>
      </div>

      <div className="grid w-full max-w-lg grid-cols-2 gap-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex items-start gap-3 rounded-xl border border-border/20 bg-card/10 p-4"
          >
            <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <feature.icon className="size-3.5" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-foreground/80">
                {feature.title}
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground/60">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
