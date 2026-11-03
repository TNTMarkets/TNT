import { once } from "node:events";
import type { RequestListener } from "node:http";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";

export async function serve(
  app: RequestListener,
  { port, onClose }: { port: number; onClose: () => Promise<void> | void },
): Promise<{ port: number; shutdown: () => Promise<void> }> {
  const server = createServer(app).listen(port);
  await once(server, "listening");
  return {
    port: (server.address() as AddressInfo).port,
    shutdown: async () => {
      const closed = once(server, "close");
      server.close();
      await closed;
      await onClose();
    },
  };
}
