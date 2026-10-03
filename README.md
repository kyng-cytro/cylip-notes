# cylip|notes

Snap, Note, Remember

A local-first note-taking PWA with real-time collaboration and AI helpers. Every note lives on your device and stays editable offline; changes sync and merge when you reconnect.

## Architecture

| Piece | Where | Role |
| --- | --- | --- |
| Nuxt app | Vercel | UI, auth (Better Auth), AI, sharing API, scheduled tasks |
| Database | Turso (SQLite) | Users, sessions, sharing permissions, and a projection of notes for search, reminders and public pages |
| Images | Vercel Blob | Note images and profile pictures |
| Sync server | Cloudflare Worker + Durable Objects (`sync/`) | One `NoteDoc` per note and one `WorkspaceDoc` per user, storing Yjs state |

On the device:

- Each note is a Yjs document persisted in IndexedDB (`y-indexeddb`) and edited with TipTap.
- Each user has a workspace document with their per-note state (pinned, archived, label, order, reminder) and labels.
- The sync engine (`lib/sync/engine.ts`) pushes local changes and pulls remote ones over HTTP, while the open note and the workspace also stay connected over WebSockets for live edits and cursors.
- A service worker caches the app shell so `/app` opens without a network connection.

Shared state (title, content, background, public, trash) lives in the note document; per-user state lives in each user's workspace, so collaborators can pin, label and order shared notes independently. Who can read or edit a note is decided by the server (`note_members`), never by the documents.

## Development

```bash
cp .env.example .env
cp sync/.dev.vars.example sync/.dev.vars
bun install
bun dev
```

`bun dev` runs the Nuxt app on `:3000` and the sync worker on `:8787`. Set the same secret in `NUXT_SYNC_SECRET` (`.env`) and `SYNC_SECRET` (`sync/.dev.vars`), and set `NUXT_AUTH_SECRET` (`openssl rand -base64 32`).

Useful scripts:

- `bun sync:typecheck` type checks the worker.
- `bun db:generate` generates a migration after editing `server/db/schema.ts`.

## Deployment

1. **Sync worker**: set `APP_URL` in `sync/wrangler.jsonc` to the app's URL, then:
   ```bash
   bunx wrangler secret put SYNC_SECRET -c sync/wrangler.jsonc
   bun sync:deploy
   ```
2. **App (Vercel)**: set these for both build and runtime, since `/app` is prerendered with its public config:
   - `NUXT_AUTH_SECRET`
   - `NUXT_SYNC_SECRET` (same value as the worker's `SYNC_SECRET`)
   - `NUXT_SYNC_URL` and `NUXT_PUBLIC_SYNC_URL` (the worker's URL)
   - `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `BLOB_READ_WRITE_TOKEN` and the existing keys in `.env.example`

   Database migrations run during the Vercel build.
3. **Google sign-in**: add `https://<app-domain>/api/auth/callback/google` as an authorized redirect URI.

## Migrating existing data

Legacy notes migrate lazily the first time their Durable Object loads: the content is converted to Yjs, inline base64 images move to Vercel Blob, and each user's workspace is built from their notes and labels. To migrate everything at once after deploying (safe to re-run):

```bash
APP_URL=https://<app-domain> NUXT_TASK_API_KEY=<key> bun migrate:local-first
```

Back up the Turso database before deploying.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
