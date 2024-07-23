import { z } from "zod";

export const notePatchSchema = z.discriminatedUnion("field", [
  z.object({ field: z.literal("pinned"), value: z.boolean() }),
  z.object({ field: z.literal("archived"), value: z.boolean() }),
  z.object({ field: z.literal("trashed"), value: z.boolean() }),
]);
