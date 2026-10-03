import { aiTitleSchema } from "@/schemas/ai";
import instructions from "../../utils/ai/title-system-prompt.md";

export default defineAuthenticatedEventHandler(async (event) => {
  const { user } = event.context;
  requireTokens(user, "title");
  const { text } = await readValidatedBody(event, aiTitleSchema.parse);
  const titles = await generateList({
    prompt: text,
    instructions,
    temperature: 0.3,
  });
  if (!titles?.length) return { titles: [] };
  await chargeTokens(user.id, "title");
  return { titles };
});
