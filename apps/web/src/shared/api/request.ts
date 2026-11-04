import type { z } from "zod";
import { errorResponseSchema } from "@tnt/api-schemas/errors";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

export async function getJson<T extends z.ZodType>(
  path: string,
  schema: T,
): Promise<z.infer<T>> {
  const res = await fetch(path, { headers: { accept: "application/json" } });
  const body: unknown = res.headers.get("content-type")?.includes("json")
    ? await res.json()
    : undefined;

  if (!res.ok) {
    const error = errorResponseSchema.safeParse(body);
    throw new ApiError(
      res.status,
      error.success ? error.data.error.code : "unexpected_response",
    );
  }
  const data = schema.safeParse(body);
  if (!data.success) throw new ApiError(res.status, "invalid_response");
  return data.data;
}
