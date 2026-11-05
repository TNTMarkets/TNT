import { z } from "zod";

export const categorySchema = z.object({
  id: z.uuid(),
  slug: z.string(),
});
export type Category = z.infer<typeof categorySchema>;

export const categoriesResponseSchema = z.object({
  categories: z.array(categorySchema),
});
export type CategoriesResponse = z.infer<typeof categoriesResponseSchema>;
