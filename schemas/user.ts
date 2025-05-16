import { z } from "zod";
import { CONSTANTS } from "@/utils/helpers";

export const magicLinkLoginSchema = z.object({
  email: z.string().email({ message: "Invalid email" }).toLowerCase(),
});

const checkFileType = (file: File): boolean => {
  if (file.name) return CONSTANTS.imageFileTypes.includes(file.type);
  return false;
};
const fileSchema = z
  .instanceof(File, { message: "File is required" })
  .refine(
    (file) => file.size <= CONSTANTS.profileImageSizeLimit,
    "File size must not exceed 1MB",
  )
  .refine((file) => checkFileType(file), "File type is not allowed");

export const updateUserSchema = z.object({
  picture: z.string().trim().url().or(fileSchema).optional(),
  name: z
    .string()
    .trim()
    .min(3, { message: "Name needs to be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email" }).trim().toLowerCase(),
});
