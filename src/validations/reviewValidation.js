import { z } from "zod";

export const assignReviewSchema = z.object({
    contentId: z.string().min(1, "Content ID required"),
    reviewerId: z.string().min(1, "Reviewer ID required"),
    dueAt: z.string().datetime().optional()
});

export const reviewDecisionSchema = z.object({
    status: z.enum(["approved", "rejected", "changes_requested"]),
    notes: z.string().optional()
});
