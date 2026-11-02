import { expect, test } from "vitest";
import { migrationsOlderThanMain } from "./migration-order.ts";

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
