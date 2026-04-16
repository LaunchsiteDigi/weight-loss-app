import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { logDailyCheckinEntry } from "@/lib/db/queries";

export const logSleep = ({ session }: { session: Session }) =>
  tool({
    description:
      "Log sleep duration and quality. Use when the user mentions how they slept, sleep hours, or rest quality. Sleep impacts weight loss significantly.",
    inputSchema: z.object({
      hours: z.number().describe("Hours of sleep"),
      quality: z
        .enum(["great", "good", "okay", "poor"])
        .describe("Sleep quality")
        .default("good"),
      notes: z.string().describe("Notes about sleep").optional(),
    }),
    execute: async ({ hours, quality, notes }) => {
      const userId = session.user?.id;
      if (!userId) return { error: "Not authenticated" };

      await logDailyCheckinEntry(userId, {
        mood: quality,
        notes: `Sleep: ${hours}h (${quality})${notes ? ` - ${notes}` : ""}`,
      });

      const tip =
        hours < 7
          ? "Aim for 7-9 hours - sleep deprivation increases hunger hormones."
          : hours > 9
            ? "Great rest! Just note that oversleeping can sometimes indicate other issues."
            : "Great sleep duration! This supports healthy metabolism.";

      return {
        success: true,
        message: `Logged ${hours} hours of sleep (${quality} quality). ${tip}`,
        hours,
        quality,
      };
    },
  });
