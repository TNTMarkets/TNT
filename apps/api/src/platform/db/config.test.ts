import { expect, test } from "vitest";
import { dbConfigFromEnv } from "./config.ts";

const credentials = {
  POSTGRES_USER: "tnt",
  POSTGRES_PASSWORD: "p@ss:w/rd#1",
  POSTGRES_DB: "market",
};

test("reads every connection part from env", () => {
  expect(
    dbConfigFromEnv({
      ...credentials,
      POSTGRES_HOST: "db",
      POSTGRES_PORT: "6543",
    }),
  ).toEqual({
    host: "db",
    port: 6543,
    user: "tnt",
    password: "p@ss:w/rd#1",
    database: "market",
  });
});

test("host defaults to localhost and port to 5432", () => {
  expect(dbConfigFromEnv(credentials)).toMatchObject({
    host: "localhost",
    port: 5432,
  });
});

test("names every missing credential and how to fix it", () => {
  const missing = () => dbConfigFromEnv({ POSTGRES_DB: "market" });

  expect(missing).toThrow("POSTGRES_USER, POSTGRES_PASSWORD");
  expect(missing).toThrow("run scripts/setup.sh");
});

test("an empty host or port falls back to the default", () => {
  expect(
    dbConfigFromEnv({ ...credentials, POSTGRES_HOST: "", POSTGRES_PORT: "" }),
  ).toMatchObject({ host: "localhost", port: 5432 });
});

test.each(["five", "0", "70000"])("rejects port %j", (port) => {
  expect(() =>
    dbConfigFromEnv({ ...credentials, POSTGRES_PORT: port }),
  ).toThrow("POSTGRES_PORT");
});
