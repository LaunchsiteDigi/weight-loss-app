import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { logDailyCheckinEntry } from "@/lib/db/queries";

export const logWorkout = ({ session }: { session: Session }) =>
  tool({
    description:
      "Log a workout or exercise session. Use when the user mentions exercising, running, walking, gym, yoga, or any physical activity.",
    inputSchema: z.object({
      activity: z.string().describe("Type of exercise (e.g., running, weights, yoga, walking)"),
      duration: z.number().describe("Duration in minutes"),
      caloriesBurned: z
        .number()
        .describe("Estimated calories burned")
        .optional(),
      intensity: z
        .enum(["light", "moderate", "intense"])
        .describe("Exercise intensity level")
        .default("moderate"),
      notes: z.string().describe("Additional workout notes").optional(),
    }),
    execute: async ({ activity, duration, caloriesBurned, intensity, notes }) => {
      const userId = session.user?.id;
      if (!userId) return { error: "Not authenticated" };

      const exerciseLog = `${activity} - ${duration}min (${intensity})${caloriesBurned ? ` ~${caloriesBurned}cal burned` : ""}`;

      await logDailyCheckinEntry(userId, {
        exercise: exerciseLog,
        notes: notes ?? undefined,
      });

      return {
        success: true,
        message: `Logged workout: ${activity} for ${duration} minutes (${intensity} intensity)${caloriesBurned ? `, ~${caloriesBurned} calories burned` : ""}`,
        activity,
        duration,
        intensity,
        caloriesBurned: caloriesBurned ?? null,
      };
    },
  });
