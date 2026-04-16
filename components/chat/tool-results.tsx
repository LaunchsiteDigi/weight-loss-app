"use client";

import {
  ScaleIcon,
  TargetIcon,
  CheckCircleIcon,
  TrendingDownIcon,
  UtensilsIcon,
  GlassWaterIcon,
  DumbbellIcon,
  MoonIcon,
  RulerIcon,
  CalculatorIcon,
  MessageSquareIcon,
  CalendarIcon,
  AlertCircleIcon,
} from "lucide-react";
import type { ReactNode } from "react";

type ToolResultData = Record<string, unknown>;

const toolRenderers: Record<
  string,
  (data: ToolResultData) => ReactNode
> = {
  logWeight: (data) => (
    <ResultCard
      icon={<ScaleIcon className="size-4" />}
      color="emerald"
      title="Weight Logged"
      data={data}
    >
      <div className="text-2xl font-bold">
        {String(data.weight)} {String(data.unit)}
      </div>
      <p className="text-xs text-muted-foreground">
        {new Date(String(data.date)).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </p>
    </ResultCard>
  ),

  setGoal: (data) => (
    <ResultCard
      icon={<TargetIcon className="size-4" />}
      color="purple"
      title="Goal Set"
      data={data}
    >
      <div className="flex items-center gap-2 text-lg font-bold">
        {String(data.startWeight)} <span className="text-muted-foreground">→</span>{" "}
        {String(data.targetWeight)} {String(data.unit)}
      </div>
      <p className="text-xs text-muted-foreground">
        {String(data.toLose)} {String(data.unit)} to lose
        {data.targetDate ? ` by ${String(data.targetDate)}` : ""}
      </p>
    </ResultCard>
  ),

  dailyCheckin: (data) => (
    <ResultCard
      icon={<CalendarIcon className="size-4" />}
      color="blue"
      title="Daily Check-in"
      data={data}
    >
      <p className="text-sm font-medium">{String(data.message)}</p>
    </ResultCard>
  ),

  logCalories: (data) => (
    <ResultCard
      icon={<UtensilsIcon className="size-4" />}
      color="orange"
      title="Calories Logged"
      data={data}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{String(data.calories)}</span>
        <span className="text-sm text-muted-foreground">cal</span>
      </div>
      <p className="text-xs text-muted-foreground">
        {String(data.mealType)}: {String(data.meal)}
      </p>
    </ResultCard>
  ),

  logWater: (data) => (
    <ResultCard
      icon={<GlassWaterIcon className="size-4" />}
      color="cyan"
      title="Water Logged"
      data={data}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{String(data.amount)}</span>
        <span className="text-sm text-muted-foreground">{String(data.unit)}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        {String(data.liters)}L total
      </p>
    </ResultCard>
  ),

  logWorkout: (data) => (
    <ResultCard
      icon={<DumbbellIcon className="size-4" />}
      color="red"
      title="Workout Logged"
      data={data}
    >
      <div className="text-lg font-bold">{String(data.activity)}</div>
      <div className="flex gap-3 text-xs text-muted-foreground">
        <span>{String(data.duration)} min</span>
        <span>{String(data.intensity)}</span>
        {data.caloriesBurned ? (
          <span>~{String(data.caloriesBurned)} cal burned</span>
        ) : null}
      </div>
    </ResultCard>
  ),

  logSleep: (data) => (
    <ResultCard
      icon={<MoonIcon className="size-4" />}
      color="indigo"
      title="Sleep Logged"
      data={data}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{String(data.hours)}</span>
        <span className="text-sm text-muted-foreground">hours</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Quality: {String(data.quality)}
      </p>
    </ResultCard>
  ),

  logMeasurements: (data) => {
    const m = data.measurements as Record<string, unknown> | undefined;
    return (
      <ResultCard
        icon={<RulerIcon className="size-4" />}
        color="pink"
        title="Measurements Logged"
        data={data}
      >
        {m && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(m)
              .filter(([k, v]) => v && k !== "unit")
              .map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="capitalize text-muted-foreground">{k}</span>
                  <span className="font-medium">
                    {String(v)}
                    {String((m as Record<string, unknown>).unit) === "inches" ? '"' : "cm"}
                  </span>
                </div>
              ))}
          </div>
        )}
      </ResultCard>
    );
  },

  calculateBMI: (data) => (
    <ResultCard
      icon={<CalculatorIcon className="size-4" />}
      color="violet"
      title="BMI Result"
      data={data}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold">{String(data.bmi)}</span>
        <span className="text-sm font-medium text-muted-foreground">
          {String(data.category)}
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(100, (Number(data.bmi) / 40) * 100)}%`,
            background:
              Number(data.bmi) < 18.5
                ? "#3b82f6"
                : Number(data.bmi) < 25
                  ? "#22c55e"
                  : Number(data.bmi) < 30
                    ? "#f59e0b"
                    : "#ef4444",
          }}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Healthy range: {String(data.healthyRange)}
      </p>
    </ResultCard>
  ),

  sendMotivation: (data) => (
    <ResultCard
      icon={<MessageSquareIcon className="size-4" />}
      color="green"
      title={data.error ? "Message Failed" : "Message Sent"}
      data={data}
    >
      <p className="text-sm">
        {data.error ? String(data.error) : String(data.message)}
      </p>
    </ResultCard>
  ),
};

const colorMap: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  red: "bg-red-500/10 text-red-600 dark:text-red-400",
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  pink: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  green: "bg-green-500/10 text-green-600 dark:text-green-400",
};

function ResultCard({
  icon,
  color,
  title,
  children,
  data,
}: {
  icon: ReactNode;
  color: string;
  title: string;
  children: ReactNode;
  data: ToolResultData;
}) {
  const hasError = Boolean(data.error);

  return (
    <div className="my-1 overflow-hidden rounded-xl border border-border/50 bg-card">
      <div className="flex items-center gap-2 border-b border-border/30 px-4 py-2.5">
        <div
          className={`flex size-6 items-center justify-center rounded-lg ${
            hasError ? "bg-destructive/10 text-destructive" : (colorMap[color] ?? colorMap.blue)
          }`}
        >
          {hasError ? <AlertCircleIcon className="size-3.5" /> : icon}
        </div>
        <span className="text-xs font-semibold tracking-wide">
          {title}
        </span>
        <CheckCircleIcon className="ml-auto size-3.5 text-emerald-500" />
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

export function renderToolResult(
  toolName: string,
  output: unknown
): ReactNode | null {
  if (!output || typeof output !== "object") return null;

  const data = output as ToolResultData;
  const renderer = toolRenderers[toolName];
  if (!renderer) return null;

  try {
    return renderer(data);
  } catch {
    return null;
  }
}
