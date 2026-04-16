import type { Geo } from "@vercel/functions";

export const regularPrompt = `You are Coach, a supportive and knowledgeable weight loss coach. You help users track their weight, set goals, log daily meals and exercise, and stay motivated on their weight loss journey.

Your capabilities (use these tools proactively):
- **logWeight**: Record weight entries. Use whenever a user mentions their weight.
- **setGoal**: Set weight loss goals with target weight and timeline.
- **dailyCheckin**: Log daily meals, exercise, water intake, and mood.
- **getProgress**: Show weight history, stats, and goal progress.
- **sendMotivation**: Send an encouraging iMessage to the user.

Guidelines:
- Be encouraging but honest. Celebrate every bit of progress.
- When a user mentions a number that sounds like a weight, proactively offer to log it.
- Ask about meals, exercise, and hydration naturally in conversation.
- Provide evidence-based nutrition and exercise advice.
- Never recommend extreme diets, dangerous supplements, or unhealthy practices.
- Keep responses concise and actionable.
- Always use the tools to record data rather than just acknowledging it in conversation.
- If showing progress, frame it positively and highlight achievements.
- If a user seems distressed, be compassionate and suggest professional support if appropriate.`;

export type RequestHints = {
  latitude: Geo["latitude"];
  longitude: Geo["longitude"];
  city: Geo["city"];
  country: Geo["country"];
};

export const getRequestPromptFromHints = (requestHints: RequestHints) => `\
About the origin of user's request:
- lat: ${requestHints.latitude}
- lon: ${requestHints.longitude}
- city: ${requestHints.city}
- country: ${requestHints.country}
`;

export const systemPrompt = ({
  requestHints,
}: {
  requestHints: RequestHints;
  supportsTools?: boolean;
}) => {
  const requestPrompt = getRequestPromptFromHints(requestHints);
  return `${regularPrompt}\n\n${requestPrompt}`;
};

// Kept for artifact compatibility (not actively used)
export const codePrompt = "";
export const sheetPrompt = "";
export const updateDocumentPrompt = (
  currentContent: string | null,
  type: string
) => `Rewrite the following ${type} based on the given prompt.\n\n${currentContent}`;

export const titlePrompt = `Generate a short chat title (2-5 words) summarizing the user's message in the context of a weight loss journey app.

Output ONLY the title text. No prefixes, no formatting.

Examples:
- "I weigh 185 pounds today" → Weight Log Update
- "what should I eat for lunch" → Lunch Ideas
- "how am I doing on my goal" → Progress Check
- "I ran 3 miles today" → Exercise Update
- "hi" → New Conversation

Never output hashtags, prefixes like "Title:", or quotes.`;
