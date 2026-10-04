import type { AnyColumn } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db, schema } from "hub:db";

export {
  and,
  eq,
  gte,
  inArray,
  lt,
  lte,
  notInArray,
  or,
  sql,
} from "drizzle-orm";

export const tables = schema;

export const decrement = (column: AnyColumn, value: number) =>
  sql`${column} - ${value}`;

export const useDrizzle = () => db;
