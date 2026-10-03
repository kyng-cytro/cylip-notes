type Payload = { kind?: "notes" | "users"; offset?: string; limit?: string };

const loadBatch = async (
  kind: "notes" | "users",
  offset: number,
  limit: number,
) => {
  const db = useDrizzle();
  const table = kind === "notes" ? tables.note : tables.user;
  const rows = await db
    .select({ id: table.id })
    .from(table)
    .orderBy(table.id)
    .limit(limit)
    .offset(offset);
  const path = (id: string) =>
    kind === "notes"
      ? `/internal/notes/${id}/load`
      : `/internal/workspaces/${id}/load`;
  const results = await Promise.allSettled(
    rows.map(({ id }) => callSyncWorker(path(id), "POST")),
  );
  const failed = rows
    .filter((_, i) => results[i]!.status === "rejected")
    .map(({ id }) => id);
  return { processed: rows.length, failed, done: rows.length < limit };
};

export default defineTask({
  meta: {
    name: "sync:migrate",
    description:
      "Loads every note and workspace into the sync server so legacy data is migrated",
  },
  async run(event) {
    const {
      kind = "notes",
      offset = "0",
      limit = "25",
    } = (event.payload ?? {}) as Payload;
    return { result: await loadBatch(kind, Number(offset), Number(limit)) };
  },
});
