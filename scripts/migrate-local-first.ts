const appUrl = process.env.APP_URL;
const taskKey = process.env.NUXT_TASK_API_KEY;
const batchSize = 25;

if (!appUrl || !taskKey) {
  console.error(
    "Usage: APP_URL=https://your-app NUXT_TASK_API_KEY=... bun scripts/migrate-local-first.ts",
  );
  process.exit(1);
}

type BatchResult = { processed: number; failed: string[]; done: boolean };

const runBatch = async (kind: "notes" | "users", offset: number) => {
  const url = new URL("/api/run-tasks/sync:migrate", appUrl);
  url.search = new URLSearchParams({
    kind,
    offset: String(offset),
    limit: String(batchSize),
  }).toString();
  const response = await fetch(url, { headers: { "x-api-key": taskKey } });
  if (!response.ok)
    throw new Error(`${kind} batch at ${offset} failed: ${response.status}`);
  const { result } = (await response.json()) as { result: BatchResult };
  return result;
};

const migrate = async (kind: "notes" | "users") => {
  const failed: string[] = [];
  let offset = 0;
  for (;;) {
    const result = await runBatch(kind, offset);
    failed.push(...result.failed);
    offset += result.processed;
    console.log(`${kind}: ${offset} loaded`);
    if (result.done) return { total: offset, failed };
  }
};

const notes = await migrate("notes");
const users = await migrate("users");

console.log(`\nNotes: ${notes.total} loaded, ${notes.failed.length} failed`);
console.log(`Workspaces: ${users.total} loaded, ${users.failed.length} failed`);
if (notes.failed.length || users.failed.length) {
  console.log("Failed ids (safe to re-run the script):", [
    ...notes.failed,
    ...users.failed,
  ]);
  process.exit(1);
}
