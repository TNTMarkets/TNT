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

export function errorHandler(
  logError: (error: unknown) => void,
): ErrorRequestHandler {
  // Express finds error handlers by their 4 parameters
  return (error: unknown, _req, res, _next) => {
    const known = error instanceof HttpError ? error : clientError(error);
    if (!known) logError(error);
    const { status, code } = known ?? new HttpError(500, "internal");
    res.status(status).json(errorResponseSchema.parse({ error: { code } }));
  };
}

// express.json() marks errors safe to show the client with `expose` and a 4xx status
function clientError(error: unknown): HttpError | undefined {
  const { expose, status, type } = (error ?? {}) as {
    expose?: boolean;
    status?: number;
    type?: string;
  };
  if (!expose || status === undefined || status >= 500) return undefined;
  return new HttpError(
    status,
    type === "entity.too.large" ? "payload_too_large" : "invalid_request",
  );
}
