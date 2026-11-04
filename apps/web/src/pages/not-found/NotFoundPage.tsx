export function NotFoundPage() {
  // TODO(TNT-22): move this UI text to translation keys
  return (
    <main data-testid="not-found" className="flex flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <a href="/" className="underline">
        Go to the home page
      </a>
    </main>
  );
}
