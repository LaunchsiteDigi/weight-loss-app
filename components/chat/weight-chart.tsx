"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type WeightEntry = {
  weight: number;
  unit: string;
  date: string;
  notes: string | null;
};

type ProgressData = {
  weightHistory: WeightEntry[];
  stats: {
    currentWeight?: number;
    startingWeight?: number;
    totalChange?: number;
    weeklyRate?: number;
    unit?: string;
    entries?: number;
  };
  goal: {
    targetWeight: number;
    startWeight: number;
    unit: string;
    remaining: number | null;
    lost: number;
    progressPercent: number;
    targetDate: string | null;
  } | null;
  recentCheckins: number;
  checkinStreak: number;
};

export function WeightChart({ data }: { data: ProgressData }) {
  const chartData = [...data.weightHistory].reverse().map((entry) => ({
    date: new Date(entry.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    weight: entry.weight,
  }));

  const unit = data.stats.unit ?? "lbs";

  return (
    <div className="my-2 rounded-xl border border-border/50 bg-card/50 p-4">
      <h3 className="mb-3 text-sm font-semibold">Weight Progress</h3>

      {chartData.length > 1 ? (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                domain={["dataMin - 2", "dataMax + 2"]}
                tick={{ fontSize: 11 }}
                tickLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                }}
                formatter={(value) => [`${value} ${unit}`, "Weight"]}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="hsl(160, 60%, 45%)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {chartData.length === 1
            ? `First entry: ${chartData[0].weight} ${unit}. Keep logging to see your trend!`
            : "No weight entries yet. Start by logging your weight!"}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {data.stats.currentWeight && (
          <StatCard
            label="Current"
            value={`${data.stats.currentWeight} ${unit}`}
          />
        )}
        {data.stats.totalChange !== undefined && (
          <StatCard
            label="Change"
            value={`${data.stats.totalChange > 0 ? "+" : ""}${data.stats.totalChange} ${unit}`}
            highlight={data.stats.totalChange <= 0}
          />
        )}
        {data.goal && (
          <StatCard
            label="Goal Progress"
            value={`${data.goal.progressPercent}%`}
            highlight={data.goal.progressPercent > 0}
          />
        )}
        <StatCard
          label="Check-in Streak"
          value={`${data.checkinStreak} day${data.checkinStreak !== 1 ? "s" : ""}`}
          highlight={data.checkinStreak >= 3}
        />
      </div>

      {data.goal && (
        <div className="mt-3 rounded-lg bg-muted/30 p-3">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {data.goal.startWeight} {data.goal.unit}
            </span>
            <span className="font-medium">
              Target: {data.goal.targetWeight} {data.goal.unit}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.min(100, data.goal.progressPercent)}%` }}
            />
          </div>
          {data.goal.remaining !== null && data.goal.remaining > 0 && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              {data.goal.remaining.toFixed(1)} {data.goal.unit} to go
              {data.goal.targetDate && ` by ${data.goal.targetDate}`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg bg-muted/30 p-2.5 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`mt-0.5 text-sm font-semibold ${highlight ? "text-emerald-500" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
