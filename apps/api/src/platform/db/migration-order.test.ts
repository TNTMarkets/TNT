import { expect, test } from "vitest";
import {
  editedMigrations,
  migrationsOlderThanMain,
} from "./migration-order.ts";

const categories = { tag: "0000_create_categories", when: 100 };
const users = { tag: "0001_create_users", when: 200 };
const listings = { tag: "0002_create_listings", when: 300 };

test("with no migrations on main nothing is flagged", () => {
  expect(migrationsOlderThanMain([], [categories])).toEqual([]);
});

test("a new migration newer than all on main passes", () => {
  expect(
    migrationsOlderThanMain([categories, users], [categories, users, listings]),
  ).toEqual([]);
});

test("a new migration older than the newest on main is flagged", () => {
  const generatedEarlier = { tag: "0002_create_favorites", when: 150 };

  expect(
    migrationsOlderThanMain(
      [categories, users],
      [categories, users, generatedEarlier],
    ),
  ).toEqual([generatedEarlier]);
});

test("migrations already on main are never flagged", () => {
  const mergedOutOfOrder = { tag: "0001_create_users", when: 50 };

  expect(
    migrationsOlderThanMain(
      [categories, mergedOutOfOrder],
      [categories, mergedOutOfOrder],
    ),
  ).toEqual([]);
});

const mainSql = {
  "0000_create_categories": "CREATE TABLE categories ...;",
  "0001_create_users": "CREATE TABLE users ...;",
};

test("migrations from main left as they are pass", () => {
  expect(editedMigrations(mainSql, { ...mainSql })).toEqual([]);
});

test("a migration from main changed in the branch is flagged", () => {
  expect(
    editedMigrations(mainSql, {
      ...mainSql,
      "0001_create_users": "CREATE TABLE users ... changed;",
    }),
  ).toEqual(["0001_create_users"]);
});

test("a migration from main deleted in the branch is flagged", () => {
  expect(
    editedMigrations(mainSql, {
      "0000_create_categories": mainSql["0000_create_categories"],
    }),
  ).toEqual(["0001_create_users"]);
});

test("a new migration only in the branch is not flagged", () => {
  expect(
    editedMigrations(mainSql, {
      ...mainSql,
      "0002_create_listings": "CREATE TABLE listings ...;",
    }),
  ).toEqual([]);
});
