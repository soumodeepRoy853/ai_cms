import { z } from "zod";

export const createTagSchema = z.object({
    name: z.string().min(2, "Name required"),
    description: z.string().optional()
});

export const updateTagSchema = createTagSchema.partial();
