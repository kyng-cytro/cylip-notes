import type { LabelOptions } from "@/schemas/label";
import type { NoteOptions } from "@/schemas/note";
import type { JSONContent } from "@tiptap/core";
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

export const user = sqliteTable("users", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("picture"),
  tokens: integer("tokens").notNull().default(100),
  joinedVia: text("joined_via", { enum: ["email", "google"] }).notNull(),
  accountType: text("account_type", { enum: ["free", "premium"] })
    .notNull()
    .default("free"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export const usersRelations = relations(user, ({ many }) => ({
  notes: many(note),
  labels: many(label),
  sessions: many(session),
  accounts: many(account),
}));

export const session = sqliteTable(
  "sessions",
  {
    id: text("id").notNull().primaryKey(),
    token: text("token").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (t) => [index("sessions_user_id_idx").on(t.userId)],
);

export const sessionsRelation = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const account = sqliteTable(
  "accounts",
  {
    id: text("id").notNull().primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (t) => [index("accounts_user_id_idx").on(t.userId)],
);

export const accountsRelation = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const verification = sqliteTable(
  "verifications",
  {
    id: text("id").notNull().primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (t) => [index("verifications_identifier_idx").on(t.identifier)],
);

export const label = sqliteTable(
  "labels",
  {
    id: text("id").notNull().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    order: integer("order").notNull().default(0),
    sortKey: text("sort_key"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),
    options: text("options", { mode: "json" })
      .default({ preview: true })
      .$type<LabelOptions>(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (t) => ({
    unq: unique().on(t.slug, t.userId),
  }),
);

export const labelsRelations = relations(label, ({ one }) => ({
  user: one(user, {
    fields: [label.userId],
    references: [user.id],
  }),
}));

export const note = sqliteTable("notes", {
  id: text("id").notNull().primaryKey(),
  slug: text("slug"),
  title: text("title"),
  content: text("content", { mode: "json" }).$type<JSONContent>(),
  options: text("options", { mode: "json" })
    .default({ preview: true, public: { enabled: false, vists: 0 } })
    .$type<NoteOptions>(),
  pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
  archived: integer("archived", { mode: "boolean" }).notNull().default(false),
  trashed: integer("trashed", { mode: "boolean" }).notNull().default(false),
  labelId: text("label_id").references(() => label.id, {
    onDelete: "set null",
  }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
  reminderAt: integer("reminder_at", { mode: "timestamp_ms" }),
  trashedAt: integer("trashed_at", { mode: "timestamp_ms" }),
  globalOrder: integer("global_order").notNull().default(0),
  labelOrder: integer("label_order"),
  sortKey: text("sort_key"),
  labelSortKey: text("label_sort_key"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export const notesRelations = relations(note, ({ one, many }) => ({
  user: one(user, {
    fields: [note.userId],
    references: [user.id],
  }),
  label: one(label, {
    fields: [note.labelId],
    references: [label.id],
  }),
  members: many(noteMember),
  invites: many(noteInvite),
}));

export const noteMember = sqliteTable(
  "note_members",
  {
    noteId: text("note_id")
      .notNull()
      .references(() => note.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["editor", "viewer"] }).notNull(),
    pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
    archived: integer("archived", { mode: "boolean" }).notNull().default(false),
    labelId: text("label_id").references(() => label.id, {
      onDelete: "set null",
    }),
    sortKey: text("sort_key"),
    labelSortKey: text("label_sort_key"),
    reminderAt: integer("reminder_at", { mode: "timestamp_ms" }),
    preview: integer("preview", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    primaryKey({ columns: [t.noteId, t.userId] }),
    index("note_members_user_id_idx").on(t.userId),
    index("note_members_reminder_at_idx").on(t.reminderAt),
  ],
);

export const noteMembersRelations = relations(noteMember, ({ one }) => ({
  note: one(note, {
    fields: [noteMember.noteId],
    references: [note.id],
  }),
  user: one(user, {
    fields: [noteMember.userId],
    references: [user.id],
  }),
}));

export const noteInvite = sqliteTable(
  "note_invites",
  {
    noteId: text("note_id")
      .notNull()
      .references(() => note.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role", { enum: ["editor", "viewer"] }).notNull(),
    invitedBy: text("invited_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    primaryKey({ columns: [t.noteId, t.email] }),
    index("note_invites_email_idx").on(t.email),
  ],
);

export const noteInvitesRelations = relations(noteInvite, ({ one }) => ({
  note: one(note, {
    fields: [noteInvite.noteId],
    references: [note.id],
  }),
  inviter: one(user, {
    fields: [noteInvite.invitedBy],
    references: [user.id],
  }),
}));

export const deletedNote = sqliteTable("deleted_notes", {
  id: text("id").notNull().primaryKey(),
  deletedAt: integer("deleted_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});
