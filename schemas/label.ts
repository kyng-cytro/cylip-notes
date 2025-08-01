import { z } from "zod";

export const labelOptionsSchema = z.object({
  preview: z.boolean(),
  background: z
    .object({
      type: z.enum(["image", "color"]).nullable(),
      value: z.string().min(1).nullable(),
    })
    .optional(),
});

export type LabelOptions = z.infer<typeof labelOptionsSchema>;

export const labelCreateSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(20, "Name must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9\s-]+$/,
      "Only letters, numbers, spaces and dashes are allowed",
    )
    .trim()
    .toLowerCase(),
  options: labelOptionsSchema,
});
