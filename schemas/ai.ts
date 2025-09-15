import z from "zod";

export const aiSuggestSchema = z.object({
  text: z.string().trim().min(1),
});

export const aiRefineSchema = aiSuggestSchema.extend({
  mode: z.enum(["refine", "shorten", "lengthen", "formal"]),
});
