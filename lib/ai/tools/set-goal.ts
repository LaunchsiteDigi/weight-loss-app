import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { setUserGoal } from "@/lib/db/queries";

export const setGoal = ({ session }: { session: Session }) =>
  tool({
    description:
      "Set a weight loss goal for the user. Use this when they want to set a target weight.",
    inputSchema: z.object({
      targetWeight: z.number().describe("Target weight to reach"),
      startWeight: z.number().describe("Current/starting weight"),
      unit: z.enum(["lbs", "kg"]).describe("Weight unit").default("lbs"),
      targetDate: z
        .string()
        .describe("Target date to reach the goal (ISO format, e.g. 2026-08-01)")
        .optional(),
    }),
    execute: async ({ targetWeight, startWeight, unit, targetDate }) => {
      const userId = session.user?.id;
      if (!userId) return { error: "Not authenticated" };

      const toLose = startWeight - targetWeight;

      await setUserGoal(userId, {
        targetWeight: String(targetWeight),
        startWeight: String(startWeight),
        unit,
        targetDate: targetDate ? new Date(targetDate) : undefined,
      });

      return {
        success: true,
        message: `Goal set: ${startWeight} ${unit} → ${targetWeight} ${unit} (${toLose} ${unit} to lose)`,
        targetWeight,
        startWeight,
        unit,
        toLose,
        targetDate: targetDate ?? null,
      };
    },
  });
