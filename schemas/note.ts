import { z } from "zod";

export const notePutSchema = z.discriminatedUnion("field", [
  z.object({ field: z.literal("title"), value: z.string().min(1) }),
  z.object({ field: z.literal("content"), value: z.any() }),
]);

export const notePatchSchema = z.discriminatedUnion("field", [
  z.object({ field: z.literal("pinned"), value: z.boolean() }),
  z.object({ field: z.literal("archived"), value: z.boolean() }),
  z.object({ field: z.literal("trashed"), value: z.boolean() }),
  z.object({ field: z.literal("showPreview"), value: z.boolean() }),
]);
