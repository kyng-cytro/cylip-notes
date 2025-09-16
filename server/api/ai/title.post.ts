import { aiTitleSchema } from "@/schemas/ai";
import { decrement } from "@/server/utils/drizzle";
import { CONSTANTS } from "@/utils/helpers";
import z from "zod";
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
    const { generateObject } = getAISDK();
    const { object } = await generateObject(text, z.string().array(), system, {
      temperature: 0.3,
    });
    if (!object || !Array.isArray(object)) {
      return { titles: [] };
    }
    const db = useDrizzle();
    await db
      .update(tables.user)
      .set({
        tokens: decrement(tables.user.tokens, CONSTANTS.rates.title),
      })
      .where(eq(tables.user.id, user.id));
    return { titles: object as string[] };
  } catch (e) {
    console.error({ e });
    throw createError({
      statusCode: 500,
      message: "Failed to generate text.",
    });
  }
});
