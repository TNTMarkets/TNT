import express, { type Express } from "express";
import { healthResponseSchema } from "@tnt/api-schemas";

export function createApp(): Express {
  const app = express();

  app.get("/api/health", (_req, res) => {
    res.json(healthResponseSchema.parse({ status: "ok" }));
  });

  return app;
}
