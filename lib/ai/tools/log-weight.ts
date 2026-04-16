import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { logWeightEntry } from "@/lib/db/queries";

export const logWeight = ({ session }: { session: Session }) =>
  tool({
    description:
      "Log a weight entry for the user. Use this whenever the user mentions their current weight.",
    inputSchema: z.object({
      weight: z.number().describe("The weight value"),
      unit: z
        .enum(["lbs", "kg"])
        .describe("Weight unit - lbs or kg")
        .default("lbs"),
      notes: z
        .string()
        .describe("Optional notes about this weigh-in")
        .optional(),
    }),
    execute: async ({ weight, unit, notes }) => {
      const userId = session.user?.id;
      if (!userId) return { error: "Not authenticated" };

      await logWeightEntry(userId, String(weight), unit, notes);

      return {
        success: true,
        message: `Logged ${weight} ${unit} on ${new Date().toLocaleDateString()}`,
        weight,
        unit,
        date: new Date().toISOString(),
      };
    },
  });
