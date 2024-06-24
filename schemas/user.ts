import { z } from "zod";

export const magicLinkLoginSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).optional(),
  email: z.string().email({ message: "Invalid email" }),
});
