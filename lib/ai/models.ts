export const DEFAULT_CHAT_MODEL = "meta-llama/llama-3.3-70b-instruct:free";

export const titleModel = {
  id: "google/gemma-3-27b-it:free",
  name: "Gemma 3 27B",
  provider: "google",
  description: "Title generation",
};

export type ModelCapabilities = {
  tools: boolean;
  vision: boolean;
  reasoning: boolean;
};

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama 3.3 70B",
    provider: "meta",
    description: "Best free model for coaching with tool support",
  },
  {
    id: "google/gemma-3-27b-it:free",
    name: "Gemma 3 27B",
    provider: "google",
    description: "Fast and capable alternative",
  },
  {
    id: "mistralai/mistral-small-3.1-24b-instruct:free",
    name: "Mistral Small 3.1",
    provider: "mistral",
    description: "Lightweight and fast",
  },
];

export function getActiveModels(): ChatModel[] {
  return chatModels;
}

export const allowedModelIds = new Set(chatModels.map((m) => m.id));

export const isDemo = false;
