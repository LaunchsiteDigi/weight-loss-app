export const DEFAULT_CHAT_MODEL = "openai/gpt-oss-120b:free";

export const titleModel = {
  id: "openai/gpt-oss-20b:free",
  name: "GPT OSS 20B",
  provider: "openai",
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
    id: "openai/gpt-oss-120b:free",
    name: "GPT OSS 120B",
    provider: "openai",
    description: "Primary model with reasoning",
  },
  {
    id: "nvidia/nemotron-3-super-120b-a12b:free",
    name: "Nemotron Super 120B",
    provider: "nvidia",
    description: "Fast fallback model",
  },
  {
    id: "google/gemma-3-27b-it:free",
    name: "Gemma 3 27B",
    provider: "google",
    description: "Lightweight alternative",
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama 3.3 70B",
    provider: "meta",
    description: "Large model for complex tasks",
  },
];

export function getActiveModels(): ChatModel[] {
  return chatModels;
}

export const allowedModelIds = new Set(chatModels.map((m) => m.id));

export const isDemo = false;
