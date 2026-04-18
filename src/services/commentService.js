import Comment from "../models/commentModel.js";
import Content from "../models/contentModel.js";
import { getContentById } from "../services/contentService.js";
import { createError } from "../utils/httpErrors.js";

const canModerate = (user, content) => {
    if (!user) return false;
    if (["admin", "editor"].includes(user.role)) return true;
    const authorId = content?.author?._id || content?.author;
    return authorId?.toString() === user._id.toString();
};

export const listComments = async (contentId, user, query) => {
    const content = await getContentById(contentId, user);

    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.min(Math.max(Number(query.limit || 50), 1), 200);
    const filter = { content: contentId };
    const includeAll = query.includeAll === "true" && canModerate(user, content);
    if (!includeAll) {
        filter.status = "visible";
    }

    const total = await Comment.countDocuments(filter);
    const items = await Comment.find(filter)
        .populate("author", "userName email role")
        .sort({ createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit);

    return {
        items,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    };
};

export const createComment = async (contentId, payload, user) => {
    if (!user) throw createError(401, "Not authorized");
    await getContentById(contentId, user);

    const body = payload?.body?.trim();
    if (!body) throw createError(400, "Comment body is required");

    const comment = new Comment({
        content: contentId,
        author: user._id,
        body,
        parent: payload?.parentId || undefined
    });

    await comment.save();
    return comment;
};

export const hideComment = async (contentId, commentId, user) => {
    if (!user) throw createError(401, "Not authorized");
    const content = await getContentById(contentId, user);
    if (!canModerate(user, content)) throw createError(403, "Not authorized");

    const comment = await Comment.findOne({ _id: commentId, content: contentId });
    if (!comment) throw createError(404, "Comment not found");

    comment.status = "hidden";
    await comment.save();
    return comment;
};

export const deleteComment = async (contentId, commentId, user) => {
    if (!user) throw createError(401, "Not authorized");
    const content = await getContentById(contentId, user);

    const comment = await Comment.findOne({ _id: commentId, content: contentId });
    if (!comment) throw createError(404, "Comment not found");

    const isOwner = comment.author.toString() === user._id.toString();
    if (!isOwner && !canModerate(user, content)) {
        throw createError(403, "Not authorized");
    }

    comment.status = "deleted";
    await comment.save();
    return comment;
};
