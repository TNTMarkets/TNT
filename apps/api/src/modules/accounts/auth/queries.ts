import { eq } from "drizzle-orm";
import type { Db } from "#platform/db/db.ts";
import { users } from "./schema.ts";

export async function getCurrentUser(db: Db, id: string | null) {
  if (!id) return null;
  const [user] = await db
    .select({ id: users.id, name: users.name, image: users.image })
    .from(users)
    .where(eq(users.id, id));
  return user ?? null;
}
