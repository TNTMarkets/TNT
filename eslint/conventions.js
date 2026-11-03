const parentImports = {
  regex: "^\\.\\./",
  message: "Import through #app/, #modules/... instead of ../",
};
const envImports = ["node:process", "process"].map((name) => ({
  name,
  importNames: ["env"],
  message: "Only the code that starts a process reads env; pass config in",
}));
const memoImports = [
  {
    name: "react",
    importNames: ["useMemo", "useCallback"],
    message: "React Compiler memoizes for you",
  },
];
const playwrightImports = [
  {
    name: "@playwright/test",
    message:
      "Import test and expect from e2e/test.ts, which adds the console check",
  },
];

const restrictedImports = (...paths) => [
  "error",
  { paths: paths.flat(), patterns: [parentImports] },
];

const envReaders = [
  "apps/api/src/main.ts",
  "apps/api/src/migrate.ts",
  "apps/**/*.config.ts",
];

export const conventions = [
  {
    files: ["apps/**/*.{ts,tsx}"],
    ignores: envReaders,
    rules: {
      "no-restricted-imports": restrictedImports(envImports),
      "no-restricted-properties": [
        "error",
        { object: "process", property: "env", message: envImports[0].message },
      ],
    },
  },
  {
    files: envReaders,
    rules: { "no-restricted-imports": restrictedImports() },
  },
  {
    files: ["apps/web/src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImports(envImports, memoImports),
    },
  },
  {
    files: ["apps/web/src/**/*.{ts,tsx}"],
    ignores: ["apps/web/src/main.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MemberExpression[object.type='MetaProperty'][property.name='env']",
          message: envImports[0].message,
        },
      ],
    },
  },
  {
    files: ["apps/web/e2e/**/*.ts"],
    ignores: ["apps/web/e2e/test.ts", "apps/web/e2e/playwright.config.ts"],
    rules: {
      "no-restricted-imports": restrictedImports(envImports, playwrightImports),
    },
  },
];
