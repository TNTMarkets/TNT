import type { ErrorRequestHandler, RequestHandler } from "express";
import { errorResponseSchema } from "@tnt/api-schemas/errors";

export class HttpError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

export const notFound: RequestHandler = () => {
  throw new HttpError(404, "not_found");
};

const expressJsonErrors: Record<string, HttpError> = {
  "entity.parse.failed": new HttpError(400, "invalid_request"),
  "entity.too.large": new HttpError(413, "payload_too_large"),
};

export function errorHandler(
  logError: (error: unknown) => void,
): ErrorRequestHandler {
  // Express finds error handlers by their 4 parameters
  return (error: unknown, _req, res, _next) => {
    const known =
      error instanceof HttpError
        ? error
        : expressJsonErrors[(error as { type?: string } | null)?.type ?? ""];
    if (!known) logError(error);
    const { status, code } = known ?? new HttpError(500, "internal");
    res.status(status).json(errorResponseSchema.parse({ error: { code } }));
  };
}
