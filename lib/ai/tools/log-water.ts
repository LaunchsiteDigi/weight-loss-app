import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { logDailyCheckinEntry } from "@/lib/db/queries";

export const logWater = ({ session }: { session: Session }) =>
  tool({
    description:
      "Log water intake. Use when the user mentions drinking water, hydration, or fluid intake.",
    inputSchema: z.object({
      amount: z.number().describe("Amount of water"),
      unit: z
        .enum(["oz", "cups", "liters", "ml"])
        .describe("Unit of measurement")
        .default("oz"),
    }),
    execute: async ({ amount, unit }) => {
      const userId = session.user?.id;
      if (!userId) return { error: "Not authenticated" };

      // Convert to liters for storage
      const liters =
        unit === "liters"
          ? amount
          : unit === "ml"
            ? amount / 1000
            : unit === "oz"
              ? amount * 0.0296
              : amount * 0.237; // cups

      await logDailyCheckinEntry(userId, {
        waterLiters: String(Math.round(liters * 100) / 100),
        notes: `Water: ${amount} ${unit}`,
      });

      return {
        success: true,
        message: `Logged ${amount} ${unit} of water (${(liters).toFixed(1)}L)`,
        amount,
        unit,
        liters: Math.round(liters * 100) / 100,
      };
    },
  });
