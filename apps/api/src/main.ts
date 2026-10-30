import express from "express";
import { healthResponseSchema } from "@tnt/api-schemas";

const app = express();

app.get("/api/health", (_req, res) => {
  res.json(healthResponseSchema.parse({ status: "ok" }));
});

const port = Number(process.env["PORT"] ?? 3000);
app.listen(port, () => {
  console.log(`api listening on :${String(port)}`);
});
