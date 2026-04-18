import * as reviewService from "../services/reviewService.js";
import Content from "../models/contentModel.js";
import { recordAudit } from "../services/auditService.js";
import { createNotification } from "../services/notificationService.js";
import { assignReviewSchema, reviewDecisionSchema } from "../validations/reviewValidation.js";

export const assignReviewController = async (req, res, next) => {
    try {
        const data = assignReviewSchema.parse(req.body);
        const review = await reviewService.assignReview(data, req.user);
        await recordAudit({
            action: "review.assign",
            entityType: "review",
            entityId: review._id,
            actor: req.user._id,
            req,
            meta: { contentId: review.content, reviewerId: review.reviewer }
        });

        const content = await Content.findById(review.content).select("title author");
        if (content?.title) {
            await createNotification({
                userId: review.reviewer,
                type: "review.assigned",
                title: `Review assigned: ${content.title}`,
                body: "You have a new review request",
                data: { contentId: review.content, reviewId: review._id },
                createdBy: req.user._id
            });
        }
        res.status(201).json({ success: true, review });
    } catch (err) {
        next(err);
    }
};

export const listAssignedReviewsController = async (req, res, next) => {
    try {
        const items = await reviewService.listAssignedReviews(req.user);
        res.status(200).json({ success: true, items });
    } catch (err) {
        next(err);
    }
};

export const listContentReviewsController = async (req, res, next) => {
    try {
        const items = await reviewService.listContentReviews(req.params.contentId);
        res.status(200).json({ success: true, items });
    } catch (err) {
        next(err);
    }
};

export const reviewDecisionController = async (req, res, next) => {
    try {
        const data = reviewDecisionSchema.parse(req.body);
        const review = await reviewService.submitReviewDecision(req.params.id, data, req.user);
        await recordAudit({
            action: `review.${review.status}`,
            entityType: "review",
            entityId: review._id,
            actor: req.user._id,
            req,
            meta: { contentId: review.content }
        });

        const content = await Content.findById(review.content).select("title author");
        if (content?.author) {
            await createNotification({
                userId: content.author,
                type: `review.${review.status}`,
                title: `Review ${review.status}: ${content.title}`,
                body: review.notes || "",
                data: { contentId: review.content, reviewId: review._id },
                createdBy: req.user._id
            });
        }
        res.status(200).json({ success: true, review });
    } catch (err) {
        next(err);
    }
};
