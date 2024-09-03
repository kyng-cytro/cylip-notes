import { drizzle } from "drizzle-orm/d1";
export { sql, eq, and, or, gt, lt } from "drizzle-orm";
import type { SerializeObject } from "nitropack";

import * as schema from "../database/schema";

export const tables = schema;

export function useDrizzle() {
  return drizzle(hubDatabase(), { schema });
}

export type User = typeof schema.user.$inferSelect;
export type Note = SerializeObject<typeof schema.note.$inferSelect>;
export type NoteWithUserAndLabel = SerializeObject<
  typeof schema.note.$inferSelect & { user: User; label: Label | null }
>;
export type Label = SerializeObject<typeof schema.label.$inferSelect>;
