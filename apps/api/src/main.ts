import { createApp } from "#app/create-app.ts";
import { dbConfigFromEnv } from "#platform/db/config.ts";
import { createDb } from "#platform/db/db.ts";
import { serve } from "#platform/http/serve.ts";

const db = createDb(dbConfigFromEnv(process.env));
const app = createApp({ db, modules: [] });
const { port, shutdown } = await serve(app, {
  port: Number(process.env["PORT"] ?? 3000),
  onClose: () => db.$client.end(),
});
console.log(`api listening on :${String(port)}`);

for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.once(signal, () => {
    console.log(`${signal}: finishing requests, then exiting`);
    void shutdown();
  });
}
