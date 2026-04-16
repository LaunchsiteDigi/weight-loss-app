import { tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { getUserProfile } from "@/lib/db/queries";
import { sendIMessage } from "@/lib/sendblue";

export const sendMotivation = ({ session }: { session: Session }) =>
  tool({
    description:
      "Send a motivational message to the user via iMessage. Use when the user asks for encouragement or you want to send them a reminder. Requires the user to have a phone number configured.",
    inputSchema: z.object({
      message: z
        .string()
        .describe("The motivational message to send via iMessage"),
    }),
    execute: async ({ message }) => {
      const userId = session.user?.id;
      if (!userId) return { error: "Not authenticated" };

      const profile = await getUserProfile(userId);
      if (!profile?.phone) {
        return {
          error:
            "No phone number configured. Please add your phone number in Settings to receive iMessages.",
        };
      }

      try {
        await sendIMessage(profile.phone, message);
        return {
          success: true,
          message: `Motivational message sent to your phone!`,
        };
      } catch (error) {
        return {
          error: `Failed to send iMessage: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
      }
    },
  });
