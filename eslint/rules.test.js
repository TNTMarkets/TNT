import { ESLint } from "eslint";
import tseslint from "typescript-eslint";
import { describe, expect, test } from "vitest";
import {
  boundariesConfig,
  findModuleCycle,
  foreignKeyDeps,
  moduleDeps,
} from "./boundaries.js";

const PROJECT_RULES = new Set([
  "boundaries/dependencies",
  "boundaries/no-unknown-files",
  "no-restricted-imports",
  "no-restricted-properties",
  "no-restricted-syntax",
]);

function linter(moduleDeps, fkDeps) {
  return new ESLint({
    cwd: import.meta.dirname + "/..",
    // Type-aware rules need a real file; these tests lint plain strings
    overrideConfig: [
      tseslint.configs.disableTypeChecked,
      ...(moduleDeps || fkDeps ? boundariesConfig(moduleDeps, fkDeps) : []),
    ],
  });
}

async function violations(filePath, code, moduleDeps, fkDeps) {
  const [result] = await linter(moduleDeps, fkDeps).lintText(code, {
    filePath,
  });
  return result.messages
    .filter((message) => PROJECT_RULES.has(message.ruleId))
    .map((message) => message.ruleId);
}

describe("layers", () => {
  test("platform can't import a module", async () => {
    expect(
      await violations(
        "apps/api/src/platform/db/x.ts",
        'export * from "#modules/listings/index.ts";',
      ),
    ).toContain("boundaries/dependencies");
  });

  test("a module can import platform", async () => {
    expect(
      await violations(
        "apps/api/src/modules/listings/x.ts",
        'export * from "#platform/db/db.ts";',
      ),
    ).toEqual([]);
  });

  test("a module can import its own files", async () => {
    expect(
      await violations(
        "apps/api/src/modules/listings/x.ts",
        'export * from "./schema.ts";',
      ),
    ).toEqual([]);
  });

  test("every file in src belongs to a layer", async () => {
    expect(
      await violations("apps/api/src/utils/x.ts", "export const x = 1;"),
    ).toContain("boundaries/no-unknown-files");
  });

  test("a test file can import test helpers", async () => {
    expect(
      await violations(
        "apps/api/src/modules/listings/x.integration.test.ts",
        'export * from "#test/db.ts";',
      ),
    ).toEqual([]);
  });

  test("a test file can build the app the way production does", async () => {
    expect(
      await violations(
        "apps/api/src/modules/listings/x.integration.test.ts",
        'export * from "#app/create-app.ts";',
      ),
    ).toEqual([]);
  });

  test("production code can't import test helpers", async () => {
    expect(
      await violations(
        "apps/api/src/modules/listings/x.ts",
        'export * from "#test/db.ts";',
      ),
    ).toContain("boundaries/dependencies");
  });
});

describe("module to module", () => {
  test("only through index.ts", async () => {
    expect(
      await violations(
        "apps/api/src/modules/chat/x.ts",
        'export * from "#modules/listings/schema.ts";',
        { api: { chat: ["listings"] }, web: {} },
      ),
    ).toContain("boundaries/dependencies");
  });

  test("only if it's on the allow-list", async () => {
    expect(
      await violations(
        "apps/api/src/modules/chat/x.ts",
        'export * from "#modules/listings/index.ts";',
      ),
    ).toContain("boundaries/dependencies");
  });

  test("index.ts of a module on the allow-list is fine", async () => {
    expect(
      await violations(
        "apps/api/src/modules/chat/x.ts",
        'export * from "#modules/listings/index.ts";',
        { api: { chat: ["listings"] }, web: {} },
      ),
    ).toEqual([]);
  });

  test("our allow-list has no cycles", () => {
    expect(findModuleCycle(moduleDeps, foreignKeyDeps)).toBe(undefined);
  });

  test("a module on foreignKeyDeps can import foreign-keys.ts", async () => {
    expect(
      await violations(
        "apps/api/src/modules/listings/x.ts",
        'export * from "#modules/accounts/foreign-keys.ts";',
        undefined,
        { api: { listings: ["accounts"] }, web: {} },
      ),
    ).toEqual([]);
  });

  test("foreign-keys.ts only if it's on foreignKeyDeps", async () => {
    expect(
      await violations(
        "apps/api/src/modules/listings/x.ts",
        'export * from "#modules/accounts/foreign-keys.ts";',
        undefined,
        { api: {}, web: {} },
      ),
    ).toContain("boundaries/dependencies");
  });

  test("foreignKeyDeps doesn't open schema.ts", async () => {
    expect(
      await violations(
        "apps/api/src/modules/listings/x.ts",
        'export * from "#modules/accounts/schema.ts";',
        undefined,
        { api: { listings: ["accounts"] }, web: {} },
      ),
    ).toContain("boundaries/dependencies");
  });

  test("foreignKeyDeps doesn't open index.ts", async () => {
    expect(
      await violations(
        "apps/api/src/modules/listings/x.ts",
        'export * from "#modules/accounts/index.ts";',
        undefined,
        { api: { listings: ["accounts"] }, web: {} },
      ),
    ).toContain("boundaries/dependencies");
  });

  test("findModuleCycle sees cycles through foreignKeyDeps", () => {
    expect(
      findModuleCycle(
        { api: { a: ["b"] }, web: {} },
        { api: { b: ["a"] }, web: {} },
      ),
    ).toEqual(["a", "b", "a"]);
  });

  test("findModuleCycle finds a cycle", () => {
    expect(findModuleCycle({ api: { a: ["b"], b: ["a"] }, web: {} })).toEqual([
      "a",
      "b",
      "a",
    ]);
    expect(findModuleCycle({ api: { a: ["b"], b: [] }, web: {} })).toBe(
      undefined,
    );
  });
});

describe("conventions", () => {
  test("no ../ imports", async () => {
    expect(
      await violations(
        "apps/api/src/modules/listings/schema/x.ts",
        'export * from "../schema.ts";',
      ),
    ).toContain("no-restricted-imports");
  });

  test("no useMemo / useCallback in web (React Compiler is on)", async () => {
    expect(
      await violations(
        "apps/web/src/app/x.tsx",
        'import { useMemo } from "react";\nexport { useMemo };',
      ),
    ).toContain("no-restricted-imports");
  });

  test("e2e specs import test from e2e/test.ts", async () => {
    expect(
      await violations(
        "apps/web/e2e/x.spec.ts",
        'export { test } from "@playwright/test";',
      ),
    ).toContain("no-restricted-imports");
    expect(
      await violations(
        "apps/web/e2e/test.ts",
        'export { test } from "@playwright/test";',
      ),
    ).toEqual([]);
  });

  test("only process starters read process.env", async () => {
    expect(
      await violations(
        "apps/api/src/modules/listings/x.ts",
        "export const port = process.env.PORT;",
      ),
    ).toContain("no-restricted-properties");
    expect(
      await violations(
        "apps/api/src/modules/listings/x.ts",
        'import { env } from "node:process";\nexport { env };',
      ),
    ).toContain("no-restricted-imports");
    expect(
      await violations(
        "apps/api/src/main.ts",
        "export const port = process.env.PORT;",
      ),
    ).toEqual([]);
  });

  test("only main.tsx reads import.meta.env in web", async () => {
    expect(
      await violations(
        "apps/web/src/app/x.ts",
        "export const mode = import.meta.env.MODE;",
      ),
    ).toContain("no-restricted-syntax");
  });

  test("a module's index.ts doesn't touch its tables", async () => {
    for (const code of [
      'export * from "./schema.ts";',
      'import { users } from "./schema.ts";\nexport { users };',
    ])
      expect(
        await violations("apps/api/src/modules/accounts/index.ts", code),
      ).toContain("no-restricted-syntax");
  });

  test("a module's foreign-keys.ts exports only functions", async () => {
    for (const code of [
      'export { users } from "./schema.ts";',
      'import { users } from "./schema.ts";\nexport { users };',
      'import { users } from "./schema.ts";\nexport const t = users;',
    ])
      expect(
        await violations("apps/api/src/modules/accounts/foreign-keys.ts", code),
      ).toContain("no-restricted-syntax");
    expect(
      await violations(
        "apps/api/src/modules/accounts/foreign-keys.ts",
        'import { users } from "./schema.ts";\nexport const userIdColumn = () => users.id;',
      ),
    ).toEqual([]);
  });

  test("a module's index.ts can re-export its other files", async () => {
    expect(
      await violations(
        "apps/api/src/modules/accounts/index.ts",
        'export { createAuth } from "./auth/auth.ts";',
      ),
    ).toEqual([]);
  });
});
