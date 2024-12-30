import type { JSONContent } from "@tiptap/core";
import { sql, relations } from "drizzle-orm";
import { sqliteTable, text, integer, unique } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("users", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  googleId: text("google_id").unique(),
  picture: text("picture"),
  tokens: integer("tokens").notNull().default(100),
  joinedVia: text("joined_via", { enum: ["email", "google"] }).notNull(),
  accountType: text("account_type", { enum: ["free", "premium"] })
    .notNull()
    .default("free"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(current_timestamp)`)
    .$onUpdate(() => sql`(current_timestamp)`),
});

export const usersRelations = relations(user, ({ many }) => ({
  notes: many(note),
  labels: many(label),
  session: many(session),
  emailVerificationTokens: many(emailVerificationToken),
}));

export const session = sqliteTable("sessions", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
  expiresAt: integer("expires_at").notNull(),
});

export const sessionsRelation = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const emailVerificationToken = sqliteTable("email_verification_tokens", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
  expiresAt: integer("expires_at").notNull(),
});

export const emailVerificationTokensRelations = relations(
  emailVerificationToken,
  ({ one }) => ({
    user: one(user, {
      fields: [emailVerificationToken.userId],
      references: [user.id],
    }),
  }),
);

export const label = sqliteTable(
  "labels",
  {
    id: text("id").notNull().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(current_timestamp)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(current_timestamp)`)
      .$onUpdate(() => sql`(current_timestamp)`),
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
  settingsId: text("settings_id").references(() => noteSettings.id),
  content: text("content", { mode: "json" }).$type<JSONContent>(),
  showPreview: integer("show_preview", { mode: "boolean" })
    .notNull()
    .default(true),
  pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
  archived: integer("archived", { mode: "boolean" }).notNull().default(false),
  trashed: integer("trashed", { mode: "boolean" }).notNull().default(false),
  labelId: text("label_id").references(() => label.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
  trashedAt: integer("trashed_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(current_timestamp)`)
    .$onUpdate(() => sql`(current_timestamp)`),
});

export const noteSettings = sqliteTable("note_settings", {
  id: text("id").notNull().primaryKey(),
  backgroundType: text("background_type", {
    enum: ["image", "color"],
  }),
  backgroundValue: text("background_value"),
});

export const notesRelations = relations(note, ({ one }) => ({
  user: one(user, {
    fields: [note.userId],
    references: [user.id],
  }),
  label: one(label, {
    fields: [note.labelId],
    references: [label.id],
  }),
  settings: one(noteSettings, {
    fields: [note.settingsId],
    references: [noteSettings.id],
  }),
}));

export const changelog = sqliteTable("change_logs", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    })
    .unique(),
  table_name: text("table_name").notNull(),
  operation: text("operation", {
    enum: ["insert", "update", "delete"],
  }).notNull(),
});
