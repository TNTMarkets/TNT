import boundaries from "eslint-plugin-boundaries";

// Which modules each module may import, through their index.ts.
export const moduleDeps = {
  api: { listings: [] },
  web: {},
};

export function findModuleCycle(deps) {
  for (const graph of Object.values(deps)) {
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
const moduleIndex = (captured) => ({
  to: {
    element: { type: "module", captured, fileInternalPath: "index.{ts,tsx}" },
  },
});

export function boundariesConfig(deps = moduleDeps) {
  const crossModule = Object.entries(deps).flatMap(([app, graph]) =>
    Object.entries(graph).map(([module, allowed]) => ({
      from: { element: { type: "module", captured: { app, module } } },
      allow: allowed.map((target) => moduleIndex({ app, module: target })),
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
        // Process starters: they wire everything, so they sit outside the layers.
        "boundaries/files": [
          {
            pattern: [
              "apps/api/src/{main,migrate}.ts",
              "apps/web/src/main.tsx",
            ],
            category: "entry",
          },
        ],
        "boundaries/elements": [
          { type: "package", pattern: "packages/*" },
          { type: "app", pattern: "apps/*/src/app", capture: ["app"] },
          { type: "page", pattern: "apps/web/src/pages/*", capture: ["page"] },
          {
            type: "module",
            pattern: "apps/*/src/modules/*",
            capture: ["app", "module"],
          },
          { type: "platform", pattern: "apps/api/src/platform" },
          { type: "shared", pattern: "apps/*/src/shared", capture: ["app"] },
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
                          app: "{{ from.element.captured.app }}",
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
              ...crossModule,
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
