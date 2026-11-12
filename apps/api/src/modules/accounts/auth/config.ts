export interface AuthConfig {
  baseURL: string;
  secret: string;
  intra42: { clientId: string; clientSecret: string };
}

export function authConfigFromEnv(
  env: Record<string, string | undefined>,
): AuthConfig {
  const required = (name: string) => {
    const value = env[name];
    if (!value) throw new Error(`${name} is not set; see .env.example`);
    return value;
  };
  return {
    baseURL: required("BETTER_AUTH_URL"),
    secret: required("BETTER_AUTH_SECRET"),
    intra42: {
      clientId: required("INTRA42_CLIENT_ID"),
      clientSecret: required("INTRA42_CLIENT_SECRET"),
    },
  };
}
