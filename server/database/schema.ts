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
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const usersRelations = relations(user, ({ many }) => ({
  session: many(session),
  labels: many(label),
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

export const labelsRelations = relations(label, ({ one }) => ({
  user: one(user, {
    fields: [label.userId],
    references: [user.id],
  }),
}));
