import type { IncomingHttpHeaders } from "node:http";
import type { RequestHandler, Response } from "express";
import { HttpError } from "./errors.ts";

export type GetUserId = (
  headers: IncomingHttpHeaders,
  res: Response,
) => Promise<string | null>;

// TODO: TNT-31 — use for protected listing routes
export function requireUser(getUserId: GetUserId): RequestHandler {
  return async (req, res, next) => {
    const userId = await getUserId(req.headers, res);
    if (!userId) throw new HttpError(401, "unauthorized");
    res.locals["userId"] = userId;
    next();
  };
}

export function getCurrentUserId(res: Response): string {
  const userId: unknown = res.locals["userId"];
  if (typeof userId !== "string") {
    throw new Error("getCurrentUserId needs requireUser before the route");
  }
  return userId;
}

export function allowGuest(getUserId: GetUserId): RequestHandler {
  return async (req, res, next) => {
    res.locals["userId"] = await getUserId(req.headers, res);
    next();
  };
}

export function findCurrentUserId(res: Response): string | null {
  const userId: unknown = res.locals["userId"];
  if (userId === undefined) {
    throw new Error("findCurrentUserId needs allowGuest before the route");
  }
  return typeof userId === "string" ? userId : null;
}
