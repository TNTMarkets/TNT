import { createAuthClient } from "better-auth/client";

export function createWebAuthClient() {
  return createAuthClient({ fetchOptions: { throw: true } });
}

export type WebAuthClient = ReturnType<typeof createWebAuthClient>;
