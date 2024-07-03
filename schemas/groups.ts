import { z } from "zod";

export const groupCreateSchema = z.object({
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
});
