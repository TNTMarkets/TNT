import { afterEach, expect, test, vi } from "vitest";
import { z } from "zod";
import { getJson } from "./request.ts";

const schema = z.object({ name: z.string() });

function respondWith(
  status: number,
  body: string,
  contentType = "application/json",
) {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve(
        new Response(body, {
          status,
          headers: { "content-type": contentType },
        }),
      ),
    ),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test("a valid response comes back as the schema's data", async () => {
  respondWith(200, JSON.stringify({ name: "a" }));

  expect(await getJson("/api/thing", schema)).toEqual({ name: "a" });
});

test("an api error becomes an ApiError with its status and code", async () => {
  respondWith(404, JSON.stringify({ error: { code: "not_found" } }));

  await expect(getJson("/api/thing", schema)).rejects.toMatchObject({
    status: 404,
    code: "not_found",
  });
});

test("an error page from the proxy becomes an ApiError too", async () => {
  respondWith(502, "<html>Bad Gateway</html>", "text/html");

  await expect(getJson("/api/thing", schema)).rejects.toMatchObject({
    status: 502,
    code: "unexpected_response",
  });
});

test("a response that doesn't match the schema is an error, not wrong data", async () => {
  respondWith(200, JSON.stringify({ name: 1 }));

  await expect(getJson("/api/thing", schema)).rejects.toMatchObject({
    status: 200,
    code: "invalid_response",
  });
});
