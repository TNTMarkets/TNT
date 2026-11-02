export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export function dbConfigFromEnv(
  env: Record<string, string | undefined>,
): DbConfig {
  const user = env["POSTGRES_USER"];
  const password = env["POSTGRES_PASSWORD"];
  const database = env["POSTGRES_DB"];
  if (!user || !password || !database) {
    const missing = Object.entries({
      POSTGRES_USER: user,
      POSTGRES_PASSWORD: password,
      POSTGRES_DB: database,
    })
      .filter(([, value]) => !value)
      .map(([name]) => name);
    throw new Error(`Not set: ${missing.join(", ")}`);
  }

  const rawPort = env["POSTGRES_PORT"] ?? "5432";
  const port = Number(rawPort);
  if (!Number.isInteger(port)) {
    throw new Error(`POSTGRES_PORT is not a number: ${rawPort}`);
  }

  return {
    host: env["POSTGRES_HOST"] ?? "localhost",
    port,
    user,
    password,
    database,
  };
}
