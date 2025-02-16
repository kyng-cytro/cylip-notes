import { z } from "zod";

export const notePostSchema = z.object({
  labelId: z.string().optional(),
});

export const notePutSchema = z.discriminatedUnion("field", [
  z.object({ field: z.literal("title"), value: z.string().min(1) }),
  z.object({ field: z.literal("content"), value: z.any() }),
]);

export const noteWebsocketPutSchema = z.object({
  content: z.any(),
});

export const noteOptionsSchema = z.object({
  preview: z.boolean().default(true),
  background: z
    .object({
      type: z.enum(["image", "color"]).nullable(),
      value: z.string().min(1).nullable(),
    })
    .optional(),
});

export type NoteOptions = z.infer<typeof noteOptionsSchema>;

export const notePatchSchema = z.discriminatedUnion("field", [
  z.object({ field: z.literal("options"), value: noteOptionsSchema }),
  z.object({ field: z.literal("pinned"), value: z.boolean() }),
  z.object({ field: z.literal("archived"), value: z.boolean() }),
  z.object({ field: z.literal("trashed"), value: z.boolean() }),
  z.object({
    field: z.literal("reminder_at"),
    value: z.coerce.date().nullable(),
  }),
  z.object({
    field: z.literal("label"),
    value: z.string().min(1).nullable(),
  }),
]);
