import { z } from "zod";

export const notePatchSchema = z
  .object({
    pinned: z.boolean().default(false),
    trashed: z.boolean().default(false),
    archived: z.boolean().default(false),
  })
  .refine((data) => data.pinned || data.trashed || data.archived, {
    message: "At least one of pinned, trashed or archived must be true.",
  });
