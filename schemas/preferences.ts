import { z } from "zod";

const userPreferencesSchema = z.object({
  applyLabelDefaults: z.boolean(),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

export const defaultPreferences: UserPreferences = {
  applyLabelDefaults: true,
};

export const updatePreferencesSchema = userPreferencesSchema.partial();
