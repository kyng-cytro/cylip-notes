import { z } from "zod";

export const magicLinkLoginSchema = z.object({
  email: z.string().email({ message: "Invalid email" }).toLowerCase(),
});

export const updateUserSchema = z.object({
  picture: z.string().trim().url().optional(),
  name: z
    .string()
    .trim()
    .min(3, { message: "Name needs to be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email" }).trim().toLowerCase(),
});
