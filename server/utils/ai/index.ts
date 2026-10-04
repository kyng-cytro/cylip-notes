import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";
import { CONSTANTS } from "@/utils/helpers";

type Feature = keyof typeof CONSTANTS.rates;

type GenerateOptions = {
  prompt: string;
  instructions: string;
  temperature: number;
};

const model = () =>
  createOpenAI({ apiKey: useRuntimeConfig().openai.apiKey })("gpt-4.1-mini");

export const generate = async (options: GenerateOptions) => {
  const { text } = await generateText({ ...options, model: model() });
  return text;
};

export const generateList = async (options: GenerateOptions) => {
  const { output } = await generateText({
    ...options,
    model: model(),
    output: Output.array({ element: z.string() }),
  });
  return output;
};

export const requireTokens = (user: AuthUser, feature: Feature) => {
  if (user.tokens < CONSTANTS.rates[feature]) {
    throw createError({
      statusCode: 403,
      message: "You do not have enough tokens to use this feature.",
    });
  }
};

export const chargeTokens = (userId: string, feature: Feature) =>
  useDrizzle()
    .update(tables.user)
    .set({ tokens: decrement(tables.user.tokens, CONSTANTS.rates[feature]) })
    .where(eq(tables.user.id, userId));
