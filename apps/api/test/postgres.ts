import { execFileSync } from "node:child_process";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import type { TestProject } from "vitest/node";
import { createDb } from "../src/platform/db/db.ts";
import { runMigrations } from "../src/platform/db/migrate.ts";

declare module "vitest" {
  export interface ProvidedContext {
    databaseUrl: string;
  }
}

export default async function setup(project: TestProject) {
  // Same Postgres image as the app
  const image = execFileSync(
    "docker",
    ["compose", "config", "--images", "db"],
    {
      encoding: "utf8",
    },
  ).trim();

  const container = await new PostgreSqlContainer(image).start();
  const databaseUrl = container.getConnectionUri();

  const db = createDb(databaseUrl);
  await runMigrations(db);
  await db.$client.end();

  project.provide("databaseUrl", databaseUrl);

  return async () => {
    await container.stop();
  };
}
