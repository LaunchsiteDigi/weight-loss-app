import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { logDailyCheckinEntry } from "@/lib/db/queries";

export const logCalories = ({ session }: { session: Session }) =>
  tool({
    description:
      "Log calorie intake for a specific meal or snack. Use when the user mentions calories, food portions, or asks to track what they ate with calorie counts.",
    inputSchema: z.object({
      meal: z.string().describe("Name or description of the meal/food"),
      calories: z.number().describe("Estimated calories"),
      mealType: z
        .enum(["breakfast", "lunch", "dinner", "snack"])
        .describe("Type of meal")
        .default("snack"),
    }),
    execute: async ({ meal, calories, mealType }) => {
      const userId = session.user?.id;
      if (!userId) return { error: "Not authenticated" };

      await logDailyCheckinEntry(userId, {
        meals: [`${mealType}: ${meal} (${calories} cal)`],
        notes: `Calorie log: ${calories} cal for ${mealType}`,
      });

      return {
        success: true,
        message: `Logged ${calories} calories for ${mealType}: ${meal}`,
        meal,
        calories,
        mealType,
      };
    },
  });
