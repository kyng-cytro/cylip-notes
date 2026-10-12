import { NOTE_PASSKEY } from "@/constants";
import { z } from "zod";

const userPreferencesSchema = z.object({
  applyLabelDefaults: z.boolean(),
  notePasskeyIds: z
    .array(z.string().min(1).max(NOTE_PASSKEY.maxCredentialIdLength))
    .max(NOTE_PASSKEY.maxKnownCredentials),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

export const defaultPreferences: UserPreferences = {
  applyLabelDefaults: true,
  notePasskeyIds: [],
};

export const updatePreferencesSchema = userPreferencesSchema.partial();
