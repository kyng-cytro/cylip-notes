import { aiSuggestSchema } from "@/schemas/ai";
import instructions from "../../utils/ai/suggestions-system-prompt.md";

export default defineAuthenticatedEventHandler(async (event) => {
  const { user } = event.context;
  requireTokens(user, "suggest");
  const { text } = await readValidatedBody(event, aiSuggestSchema.parse);
  const suggestion = await generate({
    prompt: text,
    instructions,
    temperature: 0.3,
  });
  if (!suggestion || suggestion.includes("<NO-SUGGESTION>")) {
    return { suggestion: null };
  }
  await chargeTokens(user.id, "suggest");
  return { suggestion };
});
