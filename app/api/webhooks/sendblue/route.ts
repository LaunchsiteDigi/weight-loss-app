import { generateText } from "ai";
import { NextResponse } from "next/server";
import { getLanguageModel } from "@/lib/ai/providers";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { regularPrompt } from "@/lib/ai/prompts";
import { sendIMessage } from "@/lib/sendblue";
import {
  getUserByPhone,
  getChatsByUserId,
  saveChat,
  saveMessages,
  getMessagesByChatId,
} from "@/lib/db/queries";
import { generateUUID } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    console.log("Sendblue webhook received:", {
      from: payload.from_number,
      to: payload.to_number,
      is_outbound: payload.is_outbound,
      content: payload.content?.slice(0, 50),
      status: payload.status,
    });

    // Only process inbound messages
    if (payload.is_outbound) {
      return NextResponse.json({ success: true });
    }

    const senderPhone = payload.from_number;
    const messageContent = payload.content;

    if (!senderPhone || !messageContent) {
      return NextResponse.json({ success: true });
    }

    // Look up user by phone number (checks both User and UserProfile tables)
    const userRecord = await getUserByPhone(senderPhone);

    if (!userRecord) {
      console.log("Sendblue: Unknown phone, sending signup prompt:", senderPhone);
      await sendIMessage(
        senderPhone,
        "Hey! I don't recognize your number yet. Sign up at slimzer0.com to get started with your AI weight loss coach!"
      );
      return NextResponse.json({ success: true });
    }

    const userId = userRecord.userId;

    // Get or create a chat for iMessage conversations
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

    // Save the incoming message
    const userMessageId = generateUUID();
    await saveMessages({
      messages: [
        {
          id: userMessageId,
          chatId,
          role: "user",
          parts: [{ type: "text", text: messageContent }],
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });

    // Load recent context (last 10 messages for context window)
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

    // Generate AI response (non-streaming for iMessage)
    const { text } = await generateText({
      model: getLanguageModel(DEFAULT_CHAT_MODEL),
      system: `${regularPrompt}\n\nThis conversation is happening via iMessage. Keep responses concise (under 300 characters when possible) since they're text messages. Be warm and conversational.`,
      messages: contextMessages,
    });

    // Save AI response
    const assistantMessageId = generateUUID();
    await saveMessages({
      messages: [
        {
          id: assistantMessageId,
          chatId,
          role: "assistant",
          parts: [{ type: "text", text }],
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });

    // Send reply via iMessage
    await sendIMessage(senderPhone, text);

    console.log("Sendblue: Replied to", senderPhone, "via chatId:", chatId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sendblue webhook error:", error);
    return NextResponse.json({ success: true });
  }
}
