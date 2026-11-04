import type { RequestListener } from "node:http";
import { serve } from "#platform/http/serve.ts";

export async function request(
  app: RequestListener,
  {
    method = "GET",
    path,
    body,
    rawBody,
  }: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    path: string;
    body?: unknown;
    rawBody?: string;
  },
): Promise<{ status: number; body: unknown }> {
  const { port, shutdown } = await serve(app, { port: 0, onClose: () => {} });
  try {
    const res = await fetch(`http://localhost:${String(port)}${path}`, {
      method,
      ...(body === undefined && rawBody === undefined
        ? {}
        : {
            headers: { "content-type": "application/json" },
            body: rawBody ?? JSON.stringify(body),
          }),
    });
    const isJson = res.headers.get("content-type")?.includes("json");
    return {
      status: res.status,
      body: isJson ? ((await res.json()) as unknown) : await res.text(),
    };
  } finally {
    await shutdown();
  }
}
