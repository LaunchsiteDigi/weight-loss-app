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

    // Only process inbound messages
    if (payload.is_outbound) {
      return NextResponse.json({ success: true });
    }

    const senderPhone = payload.from_number;
    const messageContent = payload.content;

    if (!senderPhone || !messageContent) {
      return NextResponse.json({ success: true });
    }

    // Look up user by phone number
    const userRecord = await getUserByPhone(senderPhone);

    if (!userRecord) {
      await sendIMessage(
        senderPhone,
        "Hey! I don't recognize your number yet. Please sign up at our app and add your phone number in Settings to get started with your weight loss coach!"
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sendblue webhook error:", error);
    return NextResponse.json({ success: true });
  }
}
