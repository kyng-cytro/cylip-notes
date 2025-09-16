import { createGoogleGenerativeAI } from "@ai-sdk/google";
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
  const { aiApiKey } = useRuntimeConfig().google;
  const google = createGoogleGenerativeAI({
    apiKey: aiApiKey,
  });
  return {
    generateText: (prompt: string, system?: string, opts?: Options) => {
      return generateText({
        system,
        prompt,
        ...opts,
        model: google("gemini-2.0-flash"),
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
        model: google("gemini-2.0-flash"),
      });
    },
  };
};
