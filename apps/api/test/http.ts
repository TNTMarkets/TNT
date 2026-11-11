import type { RequestListener } from "node:http";
import { serve } from "#platform/http/serve.ts";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
  rawBody?: string;
  headers?: Record<string, string>;
};

export async function request(
  app: RequestListener,
  options: RequestOptions,
): Promise<{ status: number; body: unknown }> {
  const { status, body } = await requestWithHeaders(app, options);
  return { status, body };
}

export async function requestWithHeaders(
  app: RequestListener,
  { method = "GET", path, body, rawBody, headers = {} }: RequestOptions,
): Promise<{ status: number; headers: Headers; body: unknown }> {
  const { port, shutdown } = await serve(app, { port: 0, onClose: () => {} });
  try {
    const hasBody = body !== undefined || rawBody !== undefined;
    const res = await fetch(`http://localhost:${String(port)}${path}`, {
      method,
      headers: hasBody
        ? { "content-type": "application/json", ...headers }
        : headers,
      ...(hasBody ? { body: rawBody ?? JSON.stringify(body) } : {}),
    });
    const isJson = res.headers.get("content-type")?.includes("json");
    return {
      status: res.status,
      headers: res.headers,
      body: isJson ? ((await res.json()) as unknown) : await res.text(),
    };
  } finally {
    await shutdown();
  }
}
