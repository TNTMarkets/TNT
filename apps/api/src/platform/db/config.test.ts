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

test("names every missing credential", () => {
  expect(() => dbConfigFromEnv({ POSTGRES_DB: "market" })).toThrow(
    "POSTGRES_USER, POSTGRES_PASSWORD",
  );
});

test("rejects a port that is not a number", () => {
  expect(() =>
    dbConfigFromEnv({ ...credentials, POSTGRES_PORT: "five" }),
  ).toThrow("POSTGRES_PORT");
});
