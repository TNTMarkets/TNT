import boundaries from "eslint-plugin-boundaries";

// Which modules each module may import, through their index.ts
export const moduleDeps = {
  api: { listings: [], accounts: [] },
  web: {},
};

// Modules whose foreign-keys.ts each may import
export const foreignKeyDeps = {
  api: { listings: ["accounts"] },
  web: {},
};

export function findModuleCycle(...depsList) {
  const apps = new Set(depsList.flatMap(Object.keys));
  for (const app of apps) {
    const graph = {};
    for (const deps of depsList)
      for (const [module, targets] of Object.entries(deps[app] ?? {}))
        graph[module] = [...(graph[module] ?? []), ...targets];
    const visit = (module, path) => {
      if (path.includes(module))
        return [...path.slice(path.indexOf(module)), module];
      for (const next of graph[module] ?? []) {
        const cycle = visit(next, [...path, module]);
        if (cycle) return cycle;
      }
      return undefined;
    };
    for (const module of Object.keys(graph)) {
      const cycle = visit(module, []);
      if (cycle) return cycle;
    }
  }
  return undefined;
}

const layer = (type) => ({ to: { element: { type } } });
const workspacePackage = layer("package");
const moduleFile = (captured, fileInternalPath) => ({
  to: { element: { type: "module", captured, fileInternalPath } },
});
const moduleIndex = (captured) => moduleFile(captured, "index.{ts,tsx}");

export function boundariesConfig(deps = moduleDeps, fkDeps = foreignKeyDeps) {
  const crossModule = (graphs, file) =>
    Object.entries(graphs).flatMap(([appName, graph]) =>
      Object.entries(graph).map(([module, allowed]) => ({
        from: { element: { type: "module", captured: { appName, module } } },
        allow: allowed.map((target) =>
          moduleFile({ appName, module: target }, file),
        ),
      })),
    );

  return [
    {
      files: ["apps/*/src/**/*.{ts,tsx}"],
      plugins: { boundaries },
      settings: {
        "import/resolver": {
          typescript: {
            project: "apps/*/tsconfig.json",
            noWarnOnMultipleProjects: true,
          },
        },
        "boundaries/files": [
          {
            pattern: [
              "apps/api/src/{main,migrate}.ts",
              "apps/web/src/main.tsx",
            ],
            category: "entry",
          },
          { pattern: "apps/*/src/**/*.test.{ts,tsx}", category: "test" },
        ],
        "boundaries/elements": [
          { type: "test-support", pattern: "apps/*/test" },
          { type: "package", pattern: "packages/*" },
          { type: "app", pattern: "apps/*/src/app", capture: ["appName"] },
          { type: "page", pattern: "apps/web/src/pages/*", capture: ["page"] },
          {
            type: "module",
            pattern: "apps/*/src/modules/*",
            capture: ["appName", "module"],
          },
          { type: "platform", pattern: "apps/api/src/platform" },
          {
            type: "shared",
            pattern: "apps/*/src/shared",
            capture: ["appName"],
          },
        ],
      },
      rules: {
        "boundaries/no-unknown-files": 2,
        "boundaries/dependencies": [
          2,
          {
            default: "disallow",
            checkUnknownLocals: true,
            policies: [
              {
                from: { file: { categories: "test" } },
                allow: [layer("test-support"), layer("app")],
              },
              {
                from: { file: { categories: "entry" } },
                allow: [
                  layer("app"),
                  layer("platform"),
                  moduleIndex({}),
                  workspacePackage,
                ],
              },
              {
                from: { element: { type: "app" } },
                allow: [
                  layer("app"),
                  layer("page"),
                  layer("platform"),
                  layer("shared"),
                  moduleIndex({}),
                  workspacePackage,
                ],
              },
              {
                from: { element: { type: "page" } },
                allow: [
                  {
                    to: {
                      element: {
                        type: "page",
                        captured: { page: "{{ from.element.captured.page }}" },
                      },
                    },
                  },
                  layer("shared"),
                  moduleIndex({}),
                  workspacePackage,
                ],
              },
              {
                from: { element: { type: "module" } },
                allow: [
                  {
                    to: {
                      element: {
                        type: "module",
                        captured: {
                          appName: "{{ from.element.captured.appName }}",
                          module: "{{ from.element.captured.module }}",
                        },
                      },
                    },
                  },
                  layer("platform"),
                  layer("shared"),
                  workspacePackage,
                ],
              },
              ...crossModule(deps, "index.{ts,tsx}"),
              ...crossModule(fkDeps, "foreign-keys.ts"),
              {
                from: { element: { type: "platform" } },
                allow: [layer("platform"), layer("shared"), workspacePackage],
              },
              {
                from: { element: { type: "shared" } },
                allow: [layer("shared"), workspacePackage],
              },
            ],
          },
        ],
      },
    },
  ];
}
