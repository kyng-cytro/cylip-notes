const ensureTable = (storage: DurableObjectStorage) =>
  storage.sql.exec(
    "CREATE TABLE IF NOT EXISTS document (id INTEGER PRIMARY KEY CHECK (id = 1), state BLOB NOT NULL)",
  );

export const loadState = (storage: DurableObjectStorage) => {
  ensureTable(storage);
  const [row] = storage.sql
    .exec<{ state: ArrayBuffer }>("SELECT state FROM document WHERE id = 1")
    .toArray();
  return row ? new Uint8Array(row.state) : null;
};

export const saveState = (storage: DurableObjectStorage, state: Uint8Array) => {
  ensureTable(storage);
  storage.sql.exec(
    "INSERT INTO document (id, state) VALUES (1, ?) ON CONFLICT (id) DO UPDATE SET state = excluded.state",
    state,
  );
};
