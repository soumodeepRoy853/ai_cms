import { z } from "zod";

export const createCommentSchema = z.object({
    body: z.string().min(1, "Comment required"),
    parentId: z.string().optional()
});

export const moderateCommentSchema = z.object({
    reason: z.string().optional()
});
