import system from "../../utils/ai/suggestions-system-prompt.md";
import { aiSuggestSchema } from "@/schemas/ai";
import { CONSTANTS } from "@/utils/helpers";
import { decrement } from "~/server/utils/drizzle";

export default defineAuthenticatedEventHandler(async (event) => {
  const { user } = event.context;
  if (user.tokens < CONSTANTS.rates.suggest) {
    throw createError({
      statusCode: 403,
      message: "You do not have enough tokens to use this feature.",
    });
  }
  const { text } = await readValidatedBody(event, aiSuggestSchema.parse);
  try {
    const { generateText } = getAISDK();
    const { text: suggestion } = await generateText(text, system);
    if (!suggestion || suggestion.includes("<NO-SUGGESTION>")) {
      return { suggestion: null };
    }
    const db = useDrizzle();
    await db.update(tables.user).set({
      tokens: decrement(tables.user.tokens, CONSTANTS.rates.suggest),
    });
    return { suggestion };
  } catch (e) {
    console.error({ e });
    throw createError({
      statusCode: 500,
      message: "Failed to generate text.",
    });
  }
});
