import { z } from "zod";

const contentTypeEnum = z.enum(["article", "page", "snippet"]);
const statusEnum = z.enum(["draft", "review", "published", "archived"]);

export const createContentSchema = z.object({
    title: z.string().min(3, "Title required"),
    slug: z.string().min(3).optional(),
    type: contentTypeEnum.optional(),
    status: statusEnum.optional(),
    excerpt: z.string().optional(),
    body: z.string().min(10, "Body required"),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    coverImage: z.string().optional(),
    seo: z.object({
        title: z.string().optional(),
        description: z.string().optional()
    }).optional()
});

export const updateContentSchema = createContentSchema.partial();
