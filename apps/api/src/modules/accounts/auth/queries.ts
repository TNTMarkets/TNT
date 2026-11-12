import { eq } from "drizzle-orm";
import type { Db } from "#platform/db/db.ts";
import { HttpError } from "#platform/http/errors.ts";
import { users } from "./schema.ts";

export async function getCurrentUser(db: Db, id: string) {
  const [user] = await db
    .select({ id: users.id, name: users.name, image: users.image })
    .from(users)
    .where(eq(users.id, id));
  if (!user) throw new HttpError(401, "unauthorized");
  return user;
}
