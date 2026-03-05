import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import z from "zod";

type Options = {
  topP?: number;
  temperature?: number;
  maxTokens?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
};

export const getAISDK = () => {
  const { apiKey } = useRuntimeConfig().openai;
  const openai = createOpenAI({
    apiKey,
  });
  return {
    generateText: (prompt: string, system?: string, opts?: Options) => {
      return generateText({
        system,
        prompt,
        ...opts,
        model: openai("gpt-3.5-turbo"),
      });
    },
    generateObject: (
      prompt: string,
      schema: z.ZodType,
      system?: string,
      opts?: Options,
    ) => {
      return generateObject({
        system,
        prompt,
        schema,
        ...opts,
        model: openai("gpt-3.5-turbo"),
      });
    },
  };
};
