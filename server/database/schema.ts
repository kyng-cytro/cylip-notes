import type { LabelOptions } from "@/schemas/label";
import type { NoteOptions } from "@/schemas/note";
import type { JSONContent } from "@tiptap/core";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

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
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
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
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
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
}));

export const changelog = sqliteTable("change_logs", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
  table_name: text("table_name").notNull(),
  operation: text("operation", {
    enum: ["insert", "update", "delete"],
  }).notNull(),
});
