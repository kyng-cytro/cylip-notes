import { generateKeyBetween } from "fractional-indexing";

export const keyBefore = (first: string | null | undefined) =>
  generateKeyBetween(null, first ?? null);

export const keyBetween = (
  before: string | null | undefined,
  after: string | null | undefined,
) => {
  const isOrdered = !before || !after || before < after;
  return generateKeyBetween(before ?? null, isOrdered ? (after ?? null) : null);
};

export const compareKeys = (a: string, b: string) =>
  a < b ? -1 : a > b ? 1 : 0;

export const byKey =
  <T>(getKey: (item: T) => string | null) =>
  (a: T, b: T) =>
    compareKeys(getKey(a) ?? "", getKey(b) ?? "");
