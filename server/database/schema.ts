import { sql, relations } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const userTable = sqliteTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  googleId: text("google_id").unique(),
  picture: text("picture"),
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
  emailVerificationTokens: many(emailVerificationTokenTable),
}));

export const sessionTable = sqliteTable(
  "session",
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
  (session) => {
    return {
      userIdx: uniqueIndex("session_user_idx").on(session.userId),
    };
  },
);

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
