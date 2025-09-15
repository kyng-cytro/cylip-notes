import { aiTitleSchema } from "@/schemas/ai";
import { decrement } from "@/server/utils/drizzle";
import { CONSTANTS } from "@/utils/helpers";
import system from "../../utils/ai/title-system-prompt.md";

export default defineAuthenticatedEventHandler(async (event) => {
  const { user } = event.context;
  if (user.tokens < CONSTANTS.rates.title) {
    throw createError({
      statusCode: 403,
      message: "You do not have enough tokens to use this feature.",
    });
  }
  const { text } = await readValidatedBody(event, aiTitleSchema.parse);
  try {
    const { generateText } = getAISDK();
    const { text: content } = await generateText(text, system);
    if (!content || content.includes("<NO-TITLE>")) {
      return { title: null };
    }
    const db = useDrizzle();
    await db
      .update(tables.user)
      .set({
        tokens: decrement(tables.user.tokens, CONSTANTS.rates.title),
      })
      .where(eq(tables.user.id, user.id));
    return { titles: content.split("\n").map((line) => line.trim()) };
  } catch (e) {
    console.error({ e });
    throw createError({
      statusCode: 500,
      message: "Failed to generate text.",
    });
  }
});
