import { sql } from "drizzle-orm";
import { db, schema } from "hub:db";
export { and, eq, gt, gte, inArray, lt, lte, or, sql } from "drizzle-orm";

import type { AnyColumn } from "drizzle-orm";

export const tables = schema;

export const decrement = (column: AnyColumn, value: number) => {
  return sql`${column} - ${value}`;
};

export function useDrizzle() {
  return db;
}

export type User = typeof schema.user.$inferSelect;

export type Note = typeof schema.note.$inferSelect & {
  label: Label | null;
};

export type NoteWithUserAndLabel = typeof schema.note.$inferSelect & {
  user: User;
  label: Label | null;
};

export type Label = typeof schema.label.$inferSelect;
