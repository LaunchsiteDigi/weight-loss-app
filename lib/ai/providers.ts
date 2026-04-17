import { customProvider } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { isTestEnvironment } from "../constants";
import { titleModel, chatModels } from "./models";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const myProvider = isTestEnvironment
  ? (() => {
      const { chatModel, titleModel } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "title-model": titleModel,
        },
      });
    })()
  : null;

export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  return openrouter(modelId);
}

export function getFallbackModelId(currentModelId: string): string | null {
  const idx = chatModels.findIndex((m) => m.id === currentModelId);
  if (idx >= 0 && idx < chatModels.length - 1) {
    return chatModels[idx + 1].id;
  }
  return null;
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }
  return openrouter(titleModel.id);
}
