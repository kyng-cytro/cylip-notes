import { aiRefineSchema } from "@/schemas/ai";
import instructions from "../../utils/ai/refinement-system-prompt.md";

export default defineAuthenticatedEventHandler(async (event) => {
  const { user } = event.context;
  requireTokens(user, "refine");
  const { text, mode } = await readValidatedBody(event, aiRefineSchema.parse);
  const refined = await generate({
    prompt: `[${mode}]: ${text}`,
    instructions,
    temperature: 0.2,
  });
  if (!refined || refined.includes("<NO-TEXT>")) return { refined: null };
  await chargeTokens(user.id, "refine");
  return { refined };
});
