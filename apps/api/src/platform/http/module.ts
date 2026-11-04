import type { Router } from "express";

export interface AppModule {
  router: Router;
}

interface Layer {
  name: string;
  slash: boolean;
  route?: { path: string; methods: Record<string, boolean> };
  handle: { stack?: Layer[] };
}

export function assertNoRouteConflicts(modules: AppModule[]): void {
  const seen = new Set<string>();
  for (const { router } of modules) {
    for (const route of routesOf(router.stack as unknown as Layer[])) {
      if (seen.has(route)) {
        throw new Error(`Two modules declare ${route}`);
      }
      seen.add(route);
    }
  }
}

// Express hides a nested router's mount path, so we forbid mounting under one.
function routesOf(stack: Layer[]): string[] {
  return stack.flatMap((layer) => {
    if (layer.route) {
      const { path, methods } = layer.route;
      return Object.keys(methods).map(
        (method) => `${method.toUpperCase()} ${path}`,
      );
    }
    if (layer.name !== "router") return [];
    if (!layer.slash) {
      throw new Error(
        "Mount feature routers without a path: router.use(featureRoutes()), with full paths on the routes",
      );
    }
    return routesOf(layer.handle.stack ?? []);
  });
}
