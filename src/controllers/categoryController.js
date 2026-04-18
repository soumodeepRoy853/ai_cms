import * as categoryService from "../services/categoryService.js";
import { recordAudit } from "../services/auditService.js";
import { createCategorySchema, updateCategorySchema } from "../validations/categoryValidation.js";

export const createCategoryController = async (req, res, next) => {
    try {
        const data = createCategorySchema.parse(req.body);
        const category = await categoryService.createCategory(data, req.user);
        await recordAudit({
            action: "category.create",
            entityType: "category",
            entityId: category._id,
            actor: req.user._id,
            req
        });
        res.status(201).json({ success: true, category });
    } catch (err) {
        next(err);
    }
};

export const listCategoryController = async (req, res, next) => {
    try {
        const result = await categoryService.listCategories(req.query);
        res.status(200).json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
};

export const updateCategoryController = async (req, res, next) => {
    try {
        const data = updateCategorySchema.parse(req.body);
        const category = await categoryService.updateCategory(req.params.id, data, req.user);
        await recordAudit({
            action: "category.update",
            entityType: "category",
            entityId: category._id,
            actor: req.user._id,
            req
        });
        res.status(200).json({ success: true, category });
    } catch (err) {
        next(err);
    }
};

export const deleteCategoryController = async (req, res, next) => {
    try {
        const result = await categoryService.deleteCategory(req.params.id);
        await recordAudit({
            action: "category.delete",
            entityType: "category",
            entityId: req.params.id,
            actor: req.user._id,
            req
        });
        res.status(200).json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
};
