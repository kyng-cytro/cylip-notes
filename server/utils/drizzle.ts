import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import type { SerializeObject } from "nitropack";
export { and, eq, gt, gte, lt, lte, or, sql } from "drizzle-orm";

import type { AnyColumn } from "drizzle-orm";
import * as schema from "../database/schema";

export const tables = schema;

export const decrement = (column: AnyColumn, value: number) => {
  return sql`${column} - ${value}`;
};

export function useDrizzle() {
  return drizzle(hubDatabase(), { schema });
}

export type User = typeof schema.user.$inferSelect;
// export type Note = SerializeObject<typeof schema.note.$inferSelect>;
export type Note = SerializeObject<
  typeof schema.note.$inferSelect & {
    label: Label | null;
  }
>;
export type NoteWithUserAndLabel = SerializeObject<
  typeof schema.note.$inferSelect & { user: User; label: Label | null }
>;
export type Label = SerializeObject<typeof schema.label.$inferSelect>;
