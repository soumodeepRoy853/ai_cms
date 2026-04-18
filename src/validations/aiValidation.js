import { z } from "zod";

const contentTypeEnum = z.enum(["article", "page", "snippet"]);
const lengthEnum = z.enum(["short", "medium", "long"]);
const statusEnum = z.enum(["draft", "review", "published", "archived"]);

export const generateContentSchema = z.object({
    prompt: z.string().min(3, "Prompt required"),
    title: z.string().optional(),
    contentType: contentTypeEnum.optional(),
    type: contentTypeEnum.optional(),
    tone: z.string().optional(),
    length: lengthEnum.optional(),
    keywords: z.array(z.string()).optional(),
    model: z.string().optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxOutputTokens: z.number().min(64).max(4000).optional(),
    linkedContentId: z.string().optional(),
    status: statusEnum.optional(),
    excerpt: z.string().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    coverImage: z.string().optional(),
    seo: z.object({
        title: z.string().optional(),
        description: z.string().optional()
    }).optional()
});

export const generateAndSaveSchema = generateContentSchema.extend({
    prompt: z.string().min(3, "Prompt required")
});
