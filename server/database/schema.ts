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
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  content: text("content"),
  labelId: text("label_id").references(() => label.id),
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
  attachments: many(attachment),
}));

export const attachment = sqliteTable("attachments", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  noteId: text("note_id")
    .notNull()
    .references(() => note.id, {
      onDelete: "cascade",
    }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(current_timestamp)`)
    .$onUpdate(() => sql`(current_timestamp)`),
});

export const attachmentsRelations = relations(attachment, ({ one }) => ({
  note: one(note, {
    fields: [attachment.noteId],
    references: [note.id],
  }),
}));
