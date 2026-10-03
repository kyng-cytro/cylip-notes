import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

type Options = {
  topP?: number;
  temperature?: number;
  maxOutputTokens?: number;
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
        instructions: system,
        prompt,
        ...opts,
        model: openai("gpt-4.1-mini"),
      });
    },
    generateObject: (
      prompt: string,
      schema: any,
      system?: string,
      opts?: Options,
    ) => {
      return generateText({
        instructions: system,
        prompt,
        ...opts,
        output: schema,
        model: openai("gpt-4.1-mini"),
      });
    },
  };
};
