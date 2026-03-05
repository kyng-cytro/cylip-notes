import type { Label, Note } from "@/server/utils/drizzle";

type SerializeDates<T> = T extends Date
  ? string
  : T extends (infer U)[]
    ? SerializeDates<U>[]
    : T extends object
      ? { [K in keyof T]: SerializeDates<T[K]> }
      : T;

export type ClientNote = SerializeDates<Note>;
export type ClientLabel = SerializeDates<Label>;
