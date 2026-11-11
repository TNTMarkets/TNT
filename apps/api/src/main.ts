import { createApp } from "#app/create-app.ts";
import {
  authConfigFromEnv,
  createAccountsModule,
  createAuth,
} from "#modules/accounts/index.ts";
import { createListingsModule } from "#modules/listings/index.ts";
import { dbConfigFromEnv } from "#platform/db/config.ts";
import { createDb } from "#platform/db/db.ts";
import { serve } from "#platform/http/serve.ts";

const db = createDb(dbConfigFromEnv(process.env));
const auth = createAuth({ db, config: authConfigFromEnv(process.env) });
const accounts = createAccountsModule({ db, auth });
const app = createApp({
  db,
  auth: accounts.authHandler,
  modules: [createListingsModule({ db }), accounts],
});
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
