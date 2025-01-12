import { drizzle } from "drizzle-orm/d1";
import type { SerializeObject } from "nitropack";
export { and, eq, gt, gte, lt, lte, or, sql } from "drizzle-orm";

import * as schema from "../database/schema";

export const tables = schema;

export function useDrizzle() {
  return drizzle(hubDatabase(), { schema });
}

export type User = typeof schema.user.$inferSelect;
// export type Note = SerializeObject<typeof schema.note.$inferSelect>;
export type Note = SerializeObject<
  typeof schema.note.$inferSelect & {
    label: Label | null;
    settings: NoteSettings | null;
  }
>;
export type NoteWithUserAndLabel = SerializeObject<
  typeof schema.note.$inferSelect & { user: User; label: Label | null }
>;
export type Label = SerializeObject<typeof schema.label.$inferSelect>;
export type NoteSettings = SerializeObject<
  typeof schema.noteSettings.$inferSelect
>;
