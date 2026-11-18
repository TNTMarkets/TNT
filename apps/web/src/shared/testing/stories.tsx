import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Decorator } from "@storybook/react-vite";

export const withQueryClient: Decorator = (Story) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <Story />
  </QueryClientProvider>
);

interface StubResponse {
  status?: number;
  body: unknown;
}

export function stubFetch(routes: Record<string, StubResponse>): () => void {
  const realFetch = globalThis.fetch;
  globalThis.fetch = (input) => {
    const url = input instanceof Request ? input.url : String(input);
    const path = new URL(url, location.origin).pathname;
    const { status = 200, body } = routes[path] ?? {
      status: 404,
      body: { error: { code: "not_found" } },
    };
    return Promise.resolve(
      new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
      }),
    );
  };
  return () => {
    globalThis.fetch = realFetch;
  };
}
