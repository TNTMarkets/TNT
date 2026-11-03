import { createApp } from "#app/create-app.ts";

const port = Number(process.env["PORT"] ?? 3000);
createApp().listen(port, () => {
  console.log(`api listening on :${String(port)}`);
});
