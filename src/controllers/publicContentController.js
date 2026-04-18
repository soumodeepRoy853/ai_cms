import * as contentService from "../services/contentService.js";

export const listPublicContentController = async (req, res, next) => {
    try {
        const result = await contentService.listPublicContent(req.query);
        res.status(200).json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
};

export const getPublicContentController = async (req, res, next) => {
    try {
        const content = await contentService.getPublicContentBySlug(req.params.slug);
        res.status(200).json({ success: true, content });
    } catch (err) {
        next(err);
    }
};
