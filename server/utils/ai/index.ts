import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

export const getAISDK = () => {
  const { aiApiKey } = useRuntimeConfig().google;
  const google = createGoogleGenerativeAI({
    apiKey: aiApiKey,
  });
  return {
    generateText: (prompt: string, system?: string) => {
      return generateText({
        system,
        prompt,
        model: google("gemini-2.0-flash"),
      });
    },
  };
};
