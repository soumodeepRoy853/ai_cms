import * as commentService from "../services/commentService.js";
import Content from "../models/contentModel.js";
import Comment from "../models/commentModel.js";
import { recordAudit } from "../services/auditService.js";
import { createNotification } from "../services/notificationService.js";
import { createCommentSchema, moderateCommentSchema } from "../validations/commentValidation.js";

export const listCommentsController = async (req, res, next) => {
    try {
        const result = await commentService.listComments(req.params.id, req.user, req.query);
        res.status(200).json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
};

export const createCommentController = async (req, res, next) => {
    try {
        const data = createCommentSchema.parse(req.body);
        const comment = await commentService.createComment(req.params.id, data, req.user);
        await recordAudit({
            action: "comment.create",
            entityType: "comment",
            entityId: comment._id,
            actor: req.user._id,
            req,
            meta: { contentId: comment.content }
        });

        const content = await Content.findById(comment.content).select("title author");
        if (content?.author) {
            await createNotification({
                userId: content.author,
                type: "comment.created",
                title: `New comment on ${content.title}`,
                body: comment.body,
                data: { contentId: comment.content, commentId: comment._id },
                createdBy: req.user._id
            });
        }

        if (comment.parent) {
            const parent = await Comment.findById(comment.parent).select("author");
            if (parent?.author) {
                await createNotification({
                    userId: parent.author,
                    type: "comment.reply",
                    title: "New reply to your comment",
                    body: comment.body,
                    data: { contentId: comment.content, commentId: comment._id, parentId: comment.parent },
                    createdBy: req.user._id
                });
            }
        }

        res.status(201).json({ success: true, comment });
    } catch (err) {
        next(err);
    }
};

export const hideCommentController = async (req, res, next) => {
    try {
        moderateCommentSchema.parse(req.body || {});
        const comment = await commentService.hideComment(req.params.id, req.params.commentId, req.user);
        await recordAudit({
            action: "comment.hide",
            entityType: "comment",
            entityId: comment._id,
            actor: req.user._id,
            req,
            meta: { contentId: comment.content }
        });
        res.status(200).json({ success: true, comment });
    } catch (err) {
        next(err);
    }
};

export const deleteCommentController = async (req, res, next) => {
    try {
        moderateCommentSchema.parse(req.body || {});
        const comment = await commentService.deleteComment(req.params.id, req.params.commentId, req.user);
        await recordAudit({
            action: "comment.delete",
            entityType: "comment",
            entityId: comment._id,
            actor: req.user._id,
            req,
            meta: { contentId: comment.content }
        });
        res.status(200).json({ success: true, comment });
    } catch (err) {
        next(err);
    }
};
