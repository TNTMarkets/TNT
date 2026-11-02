import { execFileSync } from "node:child_process";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import type { TestProject } from "vitest/node";

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
  project.provide("databaseUrl", container.getConnectionUri());

  return async () => {
    await container.stop();
  };
}
