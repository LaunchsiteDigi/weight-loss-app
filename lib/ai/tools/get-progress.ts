import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import {
  getWeightHistory,
  getActiveGoal,
  getRecentCheckins,
} from "@/lib/db/queries";

export const getProgress = ({ session }: { session: Session }) =>
  tool({
    description:
      "Get the user's weight loss progress including weight history, goal status, and recent check-ins. Use when the user asks about their progress or wants to see how they're doing.",
    inputSchema: z.object({
      days: z
        .number()
        .describe("Number of days of history to retrieve")
        .default(30),
    }),
    execute: async ({ days }) => {
      const userId = session.user?.id;
      if (!userId) return { error: "Not authenticated" };

      const [weightHistory, activeGoal, recentCheckins] = await Promise.all([
        getWeightHistory(userId, days),
        getActiveGoal(userId),
        getRecentCheckins(userId, days),
      ]);

      const weights = weightHistory.map((w) => ({
        weight: parseFloat(w.weight),
        unit: w.unit,
        date: w.date.toISOString().split("T")[0],
        notes: w.notes,
      }));

      let stats: Record<string, unknown> = {};
      if (weights.length >= 2) {
        const latest = weights[0].weight;
        const oldest = weights[weights.length - 1].weight;
        const totalChange = latest - oldest;
        const daysSpan = Math.max(
          1,
          Math.ceil(
            (new Date(weights[0].date).getTime() -
              new Date(weights[weights.length - 1].date).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        );
        stats = {
          currentWeight: latest,
          startingWeight: oldest,
          totalChange: Math.round(totalChange * 10) / 10,
          weeklyRate:
            Math.round((totalChange / daysSpan) * 7 * 10) / 10,
          unit: weights[0].unit,
          entries: weights.length,
        };
      } else if (weights.length === 1) {
        stats = {
          currentWeight: weights[0].weight,
          unit: weights[0].unit,
          entries: 1,
        };
      }

      let goalStatus: Record<string, unknown> | null = null;
      if (activeGoal) {
        const current = weights.length > 0 ? weights[0].weight : null;
        const target = parseFloat(activeGoal.targetWeight);
        const start = parseFloat(activeGoal.startWeight);
        const remaining = current ? current - target : null;
        const lost = current ? start - current : 0;
        const progressPct =
          start !== target
            ? Math.round((lost / (start - target)) * 100)
            : 0;

        goalStatus = {
          targetWeight: target,
          startWeight: start,
          unit: activeGoal.unit,
          remaining,
          lost: Math.round(lost * 10) / 10,
          progressPercent: Math.min(100, Math.max(0, progressPct)),
          targetDate: activeGoal.targetDate?.toISOString().split("T")[0] ?? null,
        };
      }

      return {
        weightHistory: weights,
        stats,
        goal: goalStatus,
        recentCheckins: recentCheckins.length,
        checkinStreak: calculateStreak(recentCheckins),
      };
    },
  });

function calculateStreak(
  checkins: { date: Date }[]
): number {
  if (checkins.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < checkins.length; i++) {
    const checkinDate = new Date(checkins[i].date);
    checkinDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);

    if (checkinDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
