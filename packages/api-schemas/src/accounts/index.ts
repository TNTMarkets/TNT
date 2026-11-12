import { z } from "zod";

export const meResponseSchema = z.object({
  user: z.object({
    id: z.uuid(),
    name: z.string(),
    image: z.string().nullable(),
  }),
});
export type MeResponse = z.infer<typeof meResponseSchema>;
