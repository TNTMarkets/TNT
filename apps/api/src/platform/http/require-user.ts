import type { IncomingHttpHeaders } from "node:http";
import type { RequestHandler, Response } from "express";
import { HttpError } from "./errors.ts";

export type GetUserId = (
  headers: IncomingHttpHeaders,
  res: Response,
) => Promise<string | null>;

export function requireUser(getUserId: GetUserId): RequestHandler {
  return async (req, res, next) => {
    const userId = await getUserId(req.headers, res);
    if (!userId) throw new HttpError(401, "unauthorized");
    res.locals["userId"] = userId;
    next();
  };
}

export function currentUserId(res: Response): string {
  const userId: unknown = res.locals["userId"];
  if (typeof userId !== "string") {
    throw new Error("currentUserId needs requireUser before the route");
  }
  return userId;
}
