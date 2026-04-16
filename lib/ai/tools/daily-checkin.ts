import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { logDailyCheckinEntry } from "@/lib/db/queries";

export const dailyCheckin = ({ session }: { session: Session }) =>
  tool({
    description:
      "Log a daily check-in with meals, exercise, water intake, and mood. Use when the user reports what they ate, their workout, or how they're feeling.",
    inputSchema: z.object({
      meals: z
        .array(z.string())
        .describe("List of meals/foods eaten today")
        .optional(),
      exercise: z
        .string()
        .describe("Description of exercise/activity done today")
        .optional(),
      waterLiters: z
        .number()
        .describe("Liters of water consumed today")
        .optional(),
      mood: z
        .enum(["great", "good", "okay", "bad"])
        .describe("How the user is feeling today")
        .optional(),
      notes: z.string().describe("Any additional notes").optional(),
    }),
    execute: async ({ meals, exercise, waterLiters, mood, notes }) => {
      const userId = session.user?.id;
      if (!userId) return { error: "Not authenticated" };

      await logDailyCheckinEntry(userId, {
        meals,
        exercise,
        waterLiters: waterLiters ? String(waterLiters) : undefined,
        mood,
        notes,
      });

      const parts = [];
      if (meals?.length) parts.push(`${meals.length} meals`);
      if (exercise) parts.push("exercise");
      if (waterLiters) parts.push(`${waterLiters}L water`);
      if (mood) parts.push(`mood: ${mood}`);

      return {
        success: true,
        message: `Daily check-in logged: ${parts.join(", ")}`,
        date: new Date().toISOString(),
      };
    },
  });
