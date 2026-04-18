import * as tagService from "../services/tagService.js";
import { recordAudit } from "../services/auditService.js";
import { createTagSchema, updateTagSchema } from "../validations/tagValidation.js";

export const createTagController = async (req, res, next) => {
    try {
        const data = createTagSchema.parse(req.body);
        const tag = await tagService.createTag(data, req.user);
        await recordAudit({
            action: "tag.create",
            entityType: "tag",
            entityId: tag._id,
            actor: req.user._id,
            req
        });
        res.status(201).json({ success: true, tag });
    } catch (err) {
        next(err);
    }
};

export const listTagController = async (req, res, next) => {
    try {
        const result = await tagService.listTags(req.query);
        res.status(200).json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
};

export const updateTagController = async (req, res, next) => {
    try {
        const data = updateTagSchema.parse(req.body);
        const tag = await tagService.updateTag(req.params.id, data, req.user);
        await recordAudit({
            action: "tag.update",
            entityType: "tag",
            entityId: tag._id,
            actor: req.user._id,
            req
        });
        res.status(200).json({ success: true, tag });
    } catch (err) {
        next(err);
    }
};

export const deleteTagController = async (req, res, next) => {
    try {
        const result = await tagService.deleteTag(req.params.id);
        await recordAudit({
            action: "tag.delete",
            entityType: "tag",
            entityId: req.params.id,
            actor: req.user._id,
            req
        });
        res.status(200).json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
};
