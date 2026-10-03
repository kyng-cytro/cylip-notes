type Kind = "notes" | "users";
type Payload = { kind?: Kind; offset?: string; limit?: string };

const loaders: Record<Kind, (id: string) => Promise<unknown>> = {
  notes: loadNoteDoc,
  users: loadWorkspaceDoc,
};

const loadBatch = async (kind: Kind, offset: number, limit: number) => {
  const table = kind === "notes" ? tables.note : tables.user;
  const rows = await useDrizzle()
    .select({ id: table.id })
    .from(table)
    .orderBy(table.id)
    .limit(limit)
    .offset(offset);
  const results = await Promise.allSettled(
    rows.map(({ id }) => loaders[kind](id)),
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
