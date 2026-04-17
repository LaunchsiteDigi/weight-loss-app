import { generateText } from "ai";
import { NextResponse } from "next/server";
import { getLanguageModel } from "@/lib/ai/providers";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { sendIMessage } from "@/lib/sendblue";
import {
  getUserByPhone,
  getChatsByUserId,
  saveChat,
  saveMessages,
  getMessagesByChatId,
  logWeightEntry,
  setUserGoal,
  logDailyCheckinEntry,
  getWeightHistory,
  getActiveGoal,
  getRecentCheckins,
} from "@/lib/db/queries";
import { generateUUID } from "@/lib/utils";

const IMESSAGE_SYSTEM_PROMPT = `You are Coach, a supportive weight loss coach communicating via text message.

IMPORTANT RULES FOR TEXT MESSAGES:
- Keep responses SHORT (under 300 characters when possible)
- Be warm, conversational, and encouraging
- NEVER output JSON, code blocks, or raw data
- NEVER output tool call syntax or function names
- Always respond in plain, friendly English
- Use casual language like you're texting a friend
- When logging data, confirm in natural language (e.g., "Got it! Logged 185 lbs")
- When showing progress, summarize in plain text (e.g., "You're down 5 lbs this month!")

You help users track weight, meals, exercise, water, sleep, and goals. When they mention data, acknowledge it naturally.`;

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    console.log("Sendblue webhook received:", {
      from: payload.from_number,
      is_outbound: payload.is_outbound,
      content: payload.content?.slice(0, 50),
    });

    if (payload.is_outbound) {
      return NextResponse.json({ success: true });
    }

    const senderPhone = payload.from_number;
    const messageContent = payload.content;

    if (!senderPhone || !messageContent) {
      return NextResponse.json({ success: true });
    }

    const userRecord = await getUserByPhone(senderPhone);

    if (!userRecord) {
      await sendIMessage(
        senderPhone,
        "Hey! Sign up at slimzer0.com to get started with your AI weight loss coach. It's free!"
      );
      return NextResponse.json({ success: true });
    }

    const userId = userRecord.userId;

    // Get or create chat
    const { chats } = await getChatsByUserId({
      id: userId,
      limit: 1,
      startingAfter: null,
      endingBefore: null,
    });

    let chatId: string;
    if (chats.length > 0) {
      chatId = chats[0].id;
    } else {
      chatId = generateUUID();
      await saveChat({
        id: chatId,
        userId,
        title: "iMessage Coach",
        visibility: "private",
      });
    }

    // Save incoming message
    await saveMessages({
      messages: [
        {
          id: generateUUID(),
          chatId,
          role: "user",
          parts: [{ type: "text", text: messageContent }],
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });

    // Process any trackable data from the message before generating response
    const contextNote = await processUserData(userId, messageContent);

    // Load recent context
    const recentMessages = await getMessagesByChatId({ id: chatId });
    const contextMessages = recentMessages.slice(-10).map((m) => ({
      role: m.role as "user" | "assistant",
      content: String(
        Array.isArray(m.parts)
          ? (m.parts as Array<{ type?: string; text?: string }>)
              .map((p) => p.text ?? "")
              .join("")
          : ""
      ),
    }));

    // Generate conversational AI response (no tools - pure text)
    const systemWithContext = contextNote
      ? `${IMESSAGE_SYSTEM_PROMPT}\n\nContext: ${contextNote}`
      : IMESSAGE_SYSTEM_PROMPT;

    const { text } = await generateText({
      model: getLanguageModel(DEFAULT_CHAT_MODEL),
      system: systemWithContext,
      messages: contextMessages,
    });

    // Clean the response - strip any accidental JSON or code blocks
    const cleanText = cleanResponse(text);

    // Save AI response
    await saveMessages({
      messages: [
        {
          id: generateUUID(),
          chatId,
          role: "assistant",
          parts: [{ type: "text", text: cleanText }],
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });

    // Send reply via iMessage
    await sendIMessage(senderPhone, cleanText);

    console.log("Sendblue: Replied to", senderPhone);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sendblue webhook error:", error);
    return NextResponse.json({ success: true });
  }
}

// Extract and log trackable data from user message
async function processUserData(
  userId: string,
  message: string
): Promise<string | null> {
  const lower = message.toLowerCase();
  const notes: string[] = [];

  // Detect weight mentions (e.g., "185 lbs", "I weigh 200", "weight 175")
  const weightMatch = lower.match(
    /(?:weigh|weight|i'm|im|currently)\s*(?:is\s*)?(\d{2,3}(?:\.\d)?)\s*(?:lbs?|pounds?|kg)?/
  ) || lower.match(/^(\d{2,3}(?:\.\d)?)\s*(?:lbs?|pounds?|kg)?$/);

  if (weightMatch) {
    const weight = weightMatch[1];
    const unit = lower.includes("kg") ? "kg" : "lbs";
    await logWeightEntry(userId, weight, unit);
    notes.push(`I just logged their weight as ${weight} ${unit}.`);
  }

  // Detect goal mentions (e.g., "goal 190", "target 170")
  const goalMatch = lower.match(
    /(?:goal|target)\s*(?:is\s*)?(\d{2,3})/
  );
  if (goalMatch) {
    const target = goalMatch[1];
    const history = await getWeightHistory(userId, 1);
    const current = history.length > 0 ? history[0].weight : target;
    await setUserGoal(userId, {
      targetWeight: target,
      startWeight: String(current),
      unit: "lbs",
    });
    notes.push(`I just set their goal to ${target} lbs.`);
  }

  // Detect water mentions
  const waterMatch = lower.match(
    /(?:drank|had|water)\s*(\d+)\s*(?:oz|cups?|glasses?|liters?|L)/
  );
  if (waterMatch) {
    const amount = waterMatch[1];
    await logDailyCheckinEntry(userId, { waterLiters: amount });
    notes.push(`I logged ${amount} water intake.`);
  }

  // Detect exercise mentions
  const exerciseMatch = lower.match(
    /(?:ran|walked|jogged|did|went)\s+(.+?)(?:\.|$)/i
  );
  if (exerciseMatch && (lower.includes("min") || lower.includes("mile") || lower.includes("gym") || lower.includes("workout") || lower.includes("treadmill"))) {
    await logDailyCheckinEntry(userId, { exercise: exerciseMatch[0] });
    notes.push(`I logged their exercise: "${exerciseMatch[0]}".`);
  }

  // Get current stats for context
  const [activeGoal, recentWeight] = await Promise.all([
    getActiveGoal(userId),
    getWeightHistory(userId, 1),
  ]);

  if (activeGoal) {
    notes.push(
      `Their current goal is ${activeGoal.targetWeight} ${activeGoal.unit} (started at ${activeGoal.startWeight}).`
    );
  }
  if (recentWeight.length > 0) {
    notes.push(
      `Their latest weight is ${recentWeight[0].weight} ${recentWeight[0].unit}.`
    );
  }

  return notes.length > 0 ? notes.join(" ") : null;
}

// Strip any JSON, code blocks, or tool syntax from AI response
function cleanResponse(text: string): string {
  let cleaned = text
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, "")
    // Remove JSON objects
    .replace(/\{[^}]*"(?:weight|target|calories|tool|function)[^}]*\}/gi, "")
    // Remove tool call syntax
    .replace(/\b(?:logWeight|setGoal|dailyCheckin|getProgress|logCalories|logWater|logWorkout|calculateBMI|mealSuggestion|logSleep|logMeasurements|sendMotivation)\b\([^)]*\)/gi, "")
    // Clean up extra whitespace
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // If everything was stripped, return a fallback
  if (!cleaned || cleaned.length < 5) {
    cleaned = "Got it! Let me know if you need anything else.";
  }

  return cleaned;
}
