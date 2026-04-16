import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { isNotNull } from "drizzle-orm";
import { userProfile } from "@/lib/db/schema";
import { sendIMessage } from "@/lib/sendblue";

const client = postgres(process.env.POSTGRES_URL ?? "");
const db = drizzle(client);

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all users with phone numbers
    const usersWithPhones = await db
      .select({
        userId: userProfile.userId,
        phone: userProfile.phone,
      })
      .from(userProfile)
      .where(isNotNull(userProfile.phone));

    const messages = [
      "Hey! How's your day going? Ready to log your meals and exercise? Just text me what you ate and any workouts you did today!",
      "Daily check-in time! How are you feeling today? Share what you've eaten and any activity you've done.",
      "Hi there! Just checking in on your weight loss journey. What did you have for meals today? Any exercise?",
      "Time for your daily update! Tell me about your meals, water intake, and how you're feeling today.",
    ];

    let sent = 0;
    for (const userRecord of usersWithPhones) {
      if (!userRecord.phone) continue;

      const randomMessage =
        messages[Math.floor(Math.random() * messages.length)];

      try {
        await sendIMessage(userRecord.phone, randomMessage);
        sent++;
      } catch (error) {
        console.error(
          `Failed to send check-in to ${userRecord.phone}:`,
          error
        );
      }
    }

    return NextResponse.json({ success: true, sent });
  } catch (error) {
    console.error("Daily check-in cron error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
