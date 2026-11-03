import { execFileSync } from "node:child_process";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import type { TestProject } from "vitest/node";
import type { DbConfig } from "#platform/db/config.ts";
import { createDb } from "#platform/db/db.ts";
import { runMigrations } from "#platform/db/migrate.ts";

declare module "vitest" {
  export interface ProvidedContext {
    dbConfig: DbConfig;
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
  const dbConfig: DbConfig = {
    host: container.getHost(),
    port: container.getPort(),
    user: container.getUsername(),
    password: container.getPassword(),
    database: container.getDatabase(),
  };

  const db = createDb(dbConfig, { onnotice: false });
  await runMigrations(db);
  await db.$client.end();

  project.provide("dbConfig", dbConfig);

  return async () => {
    await container.stop();
  };
}
