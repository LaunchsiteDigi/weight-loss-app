import { tool } from "ai";
import { z } from "zod";

export const mealSuggestion = tool({
  description:
    "Generate meal suggestions based on calorie targets and dietary preferences. Use when the user asks what to eat, needs meal ideas, or wants help planning meals.",
  inputSchema: z.object({
    mealType: z
      .enum(["breakfast", "lunch", "dinner", "snack"])
      .describe("Which meal to suggest"),
    calorieTarget: z
      .number()
      .describe("Target calories for this meal")
      .optional(),
    dietary: z
      .array(z.string())
      .describe("Dietary preferences or restrictions (e.g., vegetarian, keto, gluten-free)")
      .optional(),
    ingredients: z
      .array(z.string())
      .describe("Available ingredients the user has")
      .optional(),
  }),
  execute: async ({ mealType, calorieTarget, dietary, ingredients }) => {
    return {
      mealType,
      calorieTarget: calorieTarget ?? "not specified",
      dietary: dietary ?? [],
      ingredients: ingredients ?? [],
      message: `Here are ${mealType} suggestions${calorieTarget ? ` around ${calorieTarget} calories` : ""}${dietary?.length ? ` (${dietary.join(", ")})` : ""}. Let me recommend some options based on your preferences.`,
      note: "The AI will generate specific meal suggestions in its response text based on these parameters.",
    };
  },
});
