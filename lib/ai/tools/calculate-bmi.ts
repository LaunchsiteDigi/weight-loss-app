import { tool } from "ai";
import { z } from "zod";

export const calculateBMI = tool({
  description:
    "Calculate BMI (Body Mass Index) given height and weight. Use when the user asks about their BMI or body composition.",
  inputSchema: z.object({
    weight: z.number().describe("Weight value"),
    weightUnit: z.enum(["lbs", "kg"]).describe("Weight unit").default("lbs"),
    heightFeet: z.number().describe("Height in feet (e.g., 5)").optional(),
    heightInches: z.number().describe("Remaining inches (e.g., 10)").optional(),
    heightCm: z.number().describe("Height in centimeters").optional(),
  }),
  execute: async ({ weight, weightUnit, heightFeet, heightInches, heightCm }) => {
    let weightKg = weightUnit === "kg" ? weight : weight * 0.4536;
    let heightM: number;

    if (heightCm) {
      heightM = heightCm / 100;
    } else if (heightFeet !== undefined) {
      const totalInches = heightFeet * 12 + (heightInches ?? 0);
      heightM = totalInches * 0.0254;
    } else {
      return { error: "Please provide height in feet/inches or centimeters" };
    }

    const bmi = weightKg / (heightM * heightM);
    const rounded = Math.round(bmi * 10) / 10;

    let category: string;
    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 25) category = "Normal weight";
    else if (bmi < 30) category = "Overweight";
    else category = "Obese";

    const healthyMin = Math.round(18.5 * heightM * heightM * (weightUnit === "lbs" ? 2.205 : 1));
    const healthyMax = Math.round(24.9 * heightM * heightM * (weightUnit === "lbs" ? 2.205 : 1));

    return {
      bmi: rounded,
      category,
      healthyRange: `${healthyMin}-${healthyMax} ${weightUnit}`,
      message: `Your BMI is ${rounded} (${category}). Healthy range for your height: ${healthyMin}-${healthyMax} ${weightUnit}.`,
    };
  },
});
