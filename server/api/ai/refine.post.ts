import { aiRefineSchema } from "@/schemas/ai";
import { decrement } from "@/server/utils/drizzle";
import { CONSTANTS } from "@/utils/helpers";
import system from "../../utils/ai/refinement-system-prompt.md";

export default defineAuthenticatedEventHandler(async (event) => {
  const { user } = event.context;
  if (user.tokens < CONSTANTS.rates.refine) {
    throw createError({
      statusCode: 403,
      message: "You do not have enough tokens to use this feature.",
    });
  }
  const { text, mode } = await readValidatedBody(event, aiRefineSchema.parse);
  try {
    const { generateText } = getAISDK();
    const { text: refined } = await generateText(`[${mode}]: ${text}`, system);
    if (!refined || refined.includes("<NO-TEXT>")) {
      return { refined: null };
    }
    const db = useDrizzle();
    await db
      .update(tables.user)
      .set({
        tokens: decrement(tables.user.tokens, CONSTANTS.rates.refine),
      })
      .where(eq(tables.user.id, user.id));
    return { refined };
  } catch (e) {
    console.error({ e });
    throw createError({
      statusCode: 500,
      message: "Failed to generate text.",
    });
  }
});
