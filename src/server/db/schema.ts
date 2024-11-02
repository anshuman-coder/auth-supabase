// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  foreignKey,
  index,
  integer,
  pgTableCreator,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `${name}`);

export const posts = createTable(
  "post",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
  })
);

export const user = createTable(
  "user",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: timestamp("emailVerified", { withTimezone: true, mode: 'date' }),
  }
)

export const account = createTable(
  "account",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    refresh_token: varchar("refresh_token", { length: 255 }),
    access_token: varchar("access_token", { length: 255 }),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: varchar("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  }, (t) => ({
    fk: foreignKey({
      name: "account_user_fk",
      columns: [t.userId],
      foreignColumns: [user.id],
    })
    .onDelete("cascade"),
    uniqueProviderAccount: uniqueIndex("account_provider_providerAccountId_unique").on(t.provider, t.providerAccountId),
  })
)

export const session = createTable(
  "session",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  }, (t) => ({
    fk: foreignKey({
      name: "session_user_fk",
      columns: [t.userId],
      foreignColumns: [user.id],
    })
    .onDelete("cascade"),
    uniqueSessionToken: uniqueIndex("session_sessionToken_unique").on(t.sessionToken),
  })
)