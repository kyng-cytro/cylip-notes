import { z } from "zod";

export const magicLinkLoginSchema = z.object({
  email: z.string().email({ message: "Invalid email" }).toLowerCase(),
});
