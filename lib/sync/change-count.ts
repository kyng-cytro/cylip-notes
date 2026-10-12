import * as Y from "yjs";

export type ChangeCount = { added: number; removed: number };

const overlap = (start: number, length: number, limit: number) =>
  Math.max(0, Math.min(start + length, limit) - start);

export const countChanges = (
  update: Uint8Array,
  serverVector: Uint8Array | undefined,
): ChangeCount => {
  const server = serverVector
    ? Y.decodeStateVector(serverVector)
    : new Map<number, number>();
  const { structs, ds } = Y.decodeUpdate(update);
  const added = structs
    .filter(
      (struct): struct is Y.Item =>
        struct instanceof Y.Item &&
        struct.content instanceof Y.ContentString &&
        !Y.isDeleted(ds, struct.id),
    )
    .reduce((sum, item) => sum + item.length, 0);
  const removed = [...ds.clients].reduce(
    (sum, [client, ranges]) =>
      sum +
      ranges.reduce(
        (total, range) =>
          total + overlap(range.clock, range.len, server.get(client) ?? 0),
        0,
      ),
    0,
  );
  return { added, removed };
};
