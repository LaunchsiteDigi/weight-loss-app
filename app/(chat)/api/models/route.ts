import { chatModels } from "@/lib/ai/models";

export async function GET() {
  const headers = {
    "Cache-Control": "public, max-age=86400, s-maxage=86400",
  };

  const capabilities = Object.fromEntries(
    chatModels.map((m) => [
      m.id,
      { tools: true, vision: false, reasoning: false },
    ])
  );

  return Response.json(capabilities, { headers });
}
