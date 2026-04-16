import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { logDailyCheckinEntry } from "@/lib/db/queries";

export const logMeasurements = ({ session }: { session: Session }) =>
  tool({
    description:
      "Log body measurements like waist, hips, chest, arms, or thighs. Use when the user wants to track body measurements beyond just weight.",
    inputSchema: z.object({
      waist: z.number().describe("Waist circumference in inches").optional(),
      hips: z.number().describe("Hip circumference in inches").optional(),
      chest: z.number().describe("Chest circumference in inches").optional(),
      arms: z.number().describe("Arm circumference in inches").optional(),
      thighs: z.number().describe("Thigh circumference in inches").optional(),
      unit: z.enum(["inches", "cm"]).default("inches"),
    }),
    execute: async ({ waist, hips, chest, arms, thighs, unit }) => {
      const userId = session.user?.id;
      if (!userId) return { error: "Not authenticated" };

      const parts: string[] = [];
      if (waist) parts.push(`Waist: ${waist}${unit === "inches" ? '"' : "cm"}`);
      if (hips) parts.push(`Hips: ${hips}${unit === "inches" ? '"' : "cm"}`);
      if (chest) parts.push(`Chest: ${chest}${unit === "inches" ? '"' : "cm"}`);
      if (arms) parts.push(`Arms: ${arms}${unit === "inches" ? '"' : "cm"}`);
      if (thighs) parts.push(`Thighs: ${thighs}${unit === "inches" ? '"' : "cm"}`);

      if (parts.length === 0) {
        return { error: "Please provide at least one measurement" };
      }

      await logDailyCheckinEntry(userId, {
        notes: `Body measurements: ${parts.join(", ")}`,
      });

      return {
        success: true,
        message: `Logged measurements: ${parts.join(", ")}`,
        measurements: { waist, hips, chest, arms, thighs, unit },
      };
    },
  });
