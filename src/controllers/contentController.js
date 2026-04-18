import * as contentService from "../services/contentService.js";
import { recordAudit } from "../services/auditService.js";
import { createNotification } from "../services/notificationService.js";
import { createContentSchema, updateContentSchema } from "../validations/contentValidation.js";

export const createContentController = async (req, res, next) => {
    try {
        const data = createContentSchema.parse(req.body);
        const content = await contentService.createContent(data, req.user);
        await recordAudit({
            action: "content.create",
            entityType: "content",
            entityId: content._id,
            actor: req.user._id,
            req,
            meta: { status: content.status }
        });
        res.status(201).json({ success: true, content });
    } catch (err) {
        next(err);
    }
};

export const listContentController = async (req, res, next) => {
    try {
        const items = await contentService.listContent(req.query, req.user);
        res.status(200).json({ success: true, items });
    } catch (err) {
        next(err);
    }
};

export const getContentController = async (req, res, next) => {
    try {
        const content = await contentService.getContentById(req.params.id, req.user);
        res.status(200).json({ success: true, content });
    } catch (err) {
        next(err);
    }
};

export const updateContentController = async (req, res, next) => {
    try {
        const data = updateContentSchema.parse(req.body);
        const content = await contentService.updateContent(req.params.id, data, req.user);
        await recordAudit({
            action: "content.update",
            entityType: "content",
            entityId: content._id,
            actor: req.user._id,
            req
        });
        res.status(200).json({ success: true, content });
    } catch (err) {
        next(err);
    }
};

export const deleteContentController = async (req, res, next) => {
    try {
        const result = await contentService.deleteContent(req.params.id, req.user);
        await recordAudit({
            action: "content.delete",
            entityType: "content",
            entityId: req.params.id,
            actor: req.user._id,
            req
        });
        res.status(200).json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
};

export const publishContentController = async (req, res, next) => {
    try {
        const content = await contentService.publishContent(req.params.id, req.user);
        await recordAudit({
            action: "content.publish",
            entityType: "content",
            entityId: content._id,
            actor: req.user._id,
            req
        });
        if (content.author) {
            await createNotification({
                userId: content.author,
                type: "content.published",
                title: `Content published: ${content.title}`,
                body: "Your content has been published",
                data: { contentId: content._id },
                createdBy: req.user._id
            });
        }
        res.status(200).json({ success: true, content });
    } catch (err) {
        next(err);
    }
};
