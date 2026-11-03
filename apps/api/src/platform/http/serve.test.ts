import express from "express";
import { expect, test, vi } from "vitest";
import { serve } from "./serve.ts";

test("shutdown refuses new connections, finishes the current request, then closes", async () => {
  const { promise: arrived, resolve: arrive } =
    Promise.withResolvers<undefined>();
  const { promise: released, resolve: release } =
    Promise.withResolvers<undefined>();
  const app = express();
  app.get("/slow", async (_req, res) => {
    arrive(undefined);
    await released;
    res.send("done");
  });
  const onClose = vi.fn();
  const { port, shutdown } = await serve(app, { port: 0, onClose });

  const inFlight = fetch(`http://localhost:${String(port)}/slow`);
  await arrived;
  const closing = shutdown();

  await expect(
    fetch(`http://localhost:${String(port)}/other`),
  ).rejects.toThrow();
  expect(onClose).not.toHaveBeenCalled();

  release(undefined);
  expect((await inFlight).status).toBe(200);
  await closing;
  expect(onClose).toHaveBeenCalledOnce();
});
