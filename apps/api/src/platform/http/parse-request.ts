import type { z } from "zod";
import { HttpError } from "./errors.ts";

export function parseRequest<T extends z.ZodType>(
  schema: T,
  value: unknown,
): z.infer<T> {
  const result = schema.safeParse(value);
  if (!result.success) throw new HttpError(400, "invalid_request");
  return result.data;
}
