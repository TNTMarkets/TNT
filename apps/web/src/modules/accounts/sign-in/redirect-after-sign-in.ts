const placeholderOrigin = "http://placeholder.invalid";

export function redirectAfterSignIn(redirect: string | undefined): string {
  if (!redirect) return "/";
  const url = new URL(redirect, placeholderOrigin);
  return url.origin === placeholderOrigin
    ? `${url.pathname}${url.search}${url.hash}`
    : "/";
}
