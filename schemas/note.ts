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

export const notePatchSchema = z.discriminatedUnion("field", [
  z.object({ field: z.literal("pinned"), value: z.boolean() }),
  z.object({ field: z.literal("archived"), value: z.boolean() }),
  z.object({ field: z.literal("trashed"), value: z.boolean() }),
  z.object({ field: z.literal("showPreview"), value: z.boolean() }),
  z.object({
    field: z.literal("label"),
    value: z.string().min(1).nullable(),
  }),
]);

export const noteSettingsPatchSchema = z.discriminatedUnion("field", [
  z.object({
    field: z.literal("background"),
    value: z.object({
      backgroundType: z.enum(["image", "color"]).nullable(),
      backgroundValue: z.string().min(1).nullable(),
    }),
  }),
]);
