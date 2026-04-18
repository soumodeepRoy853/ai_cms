import Review from "../models/reviewModel.js";
import Content from "../models/contentModel.js";
import { createRevisionSnapshot } from "../services/contentService.js";
import { createError } from "../utils/httpErrors.js";

const canAssignReview = (user) => ["admin", "editor"].includes(user?.role);

export const assignReview = async (payload, user) => {
    if (!user) throw createError(401, "Not authorized");
    if (!canAssignReview(user)) throw createError(403, "Not authorized");

    const content = await Content.findById(payload.contentId);
    if (!content) throw createError(404, "Content not found");

    const existing = await Review.findOne({ content: payload.contentId, reviewer: payload.reviewerId });
    if (existing) throw createError(409, "Review already assigned");

    const review = new Review({
        content: payload.contentId,
        reviewer: payload.reviewerId,
        assignedBy: user._id,
        dueAt: payload.dueAt || undefined
    });
    await review.save();

    content.status = "review";
    await content.save();
    await createRevisionSnapshot(content, user, "review_assigned");

    return review;
};

export const listAssignedReviews = async (user) => {
    if (!user) throw createError(401, "Not authorized");

    return Review.find({ reviewer: user._id })
        .populate("content", "title status slug")
        .sort({ assignedAt: -1 });
};

export const listContentReviews = async (contentId) => {
    return Review.find({ content: contentId })
        .populate("reviewer", "userName email role")
        .sort({ assignedAt: -1 });
};

export const submitReviewDecision = async (reviewId, payload, user) => {
    if (!user) throw createError(401, "Not authorized");

    const review = await Review.findById(reviewId);
    if (!review) throw createError(404, "Review not found");
    if (review.reviewer.toString() !== user._id.toString()) {
        throw createError(403, "Not authorized");
    }

    review.status = payload.status;
    review.notes = payload.notes || "";
    review.reviewedAt = new Date();
    await review.save();

    const content = await Content.findById(review.content);
    if (content) {
        if (["changes_requested", "rejected"].includes(payload.status)) {
            content.status = "draft";
        }
        await content.save();
        await createRevisionSnapshot(content, user, `review_${payload.status}`);
    }

    return review;
};
