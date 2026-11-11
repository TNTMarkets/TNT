import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

const id = () =>
  uuid()
    .primaryKey()
    .default(sql`uuidv7()`);
const at = (name: string) => timestamp(name, { withTimezone: true });
const createdAt = () => at("created_at").defaultNow().notNull();
const updatedAt = () =>
  at("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull();

export const users = pgTable("users", {
  id: id(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

const userId = () =>
  uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" });

export const sessions = pgTable(
  "sessions",
  {
    id: id(),
    expiresAt: at("expires_at").notNull(),
    token: text().notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: userId(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)],
);

export const accounts = pgTable(
  "accounts",
  {
    id: id(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: userId(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: at("access_token_expires_at"),
    refreshTokenExpiresAt: at("refresh_token_expires_at"),
    scope: text(),
    password: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("accounts_user_id_idx").on(table.userId),
    // Better Auth doesn't add it: without it a double first sign-in makes two rows and locks the user out
    unique("accounts_provider_account_unique").on(
      table.providerId,
      table.accountId,
    ),
  ],
);

export const verifications = pgTable(
  "verifications",
  {
    id: id(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: at("expires_at").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)],
);
