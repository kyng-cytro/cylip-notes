import { z } from "zod";

const noteOptionsSchema = z.object({
  preview: z.boolean().default(true),
  public: z.object({
    vists: z.number().default(0),
    enabled: z.boolean().default(false),
  }),
  background: z
    .object({
      type: z.enum(["image", "color"]).nullable(),
      value: z.string().min(1).nullable(),
    })
    .nullish(),
});

export type NoteOptions = z.infer<typeof noteOptionsSchema>;

const memberRoleSchema = z.enum(["editor", "viewer"]);

export const addMemberSchema = z.object({
  email: z.email().trim().toLowerCase(),
  role: memberRoleSchema,
});

export const updateMemberSchema = z.object({ role: memberRoleSchema });

export const notePasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

export const noteUnlockSchema = z.object({
  password: z.string().min(1, "Enter the password").max(128),
});
