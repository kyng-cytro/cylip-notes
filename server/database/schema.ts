import { sql, relations } from "drizzle-orm";
import { sqliteTable, text, integer, unique } from "drizzle-orm/sqlite-core";

export const userTable = sqliteTable("user", {
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
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const usersRelations = relations(userTable, ({ many }) => ({
  session: many(sessionTable),
  noteGroups: many(noteGroupTable),
  emailVerificationTokens: many(emailVerificationTokenTable),
}));

export const sessionTable = sqliteTable("session", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),
  expiresAt: integer("expires_at").notNull(),
});

export const sessionsRelations = relations(sessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
  }),
}));

export const emailVerificationTokenTable = sqliteTable(
  "email_verification_token",
  {
    id: text("id").notNull().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
    expiresAt: integer("expires_at").notNull(),
  },
);

export const emailVerificationTokensRelations = relations(
  emailVerificationTokenTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [emailVerificationTokenTable.userId],
      references: [userTable.id],
    }),
  }),
);

export const noteGroupTable = sqliteTable(
  "note_groups",
  {
    id: text("id").notNull().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => ({
    unq: unique().on(t.slug, t.userId),
  }),
);

export const noteGroupsRelations = relations(noteGroupTable, ({ one }) => ({
  user: one(userTable, {
    fields: [noteGroupTable.userId],
    references: [userTable.id],
  }),
}));
