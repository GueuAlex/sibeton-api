import { z } from "zod";

export const categorySchema = z.object({
  label: z
    .string()
    .min(1, "Category label is required")
    .max(100, "Category label must be 100 characters or less"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
