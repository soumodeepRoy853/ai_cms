import * as revisionService from "../services/revisionService.js";
import { createError } from "../utils/httpErrors.js";

export const listRevisionsController = async (req, res, next) => {
    try {
        const items = await revisionService.listRevisions(req.params.id, req.user);
        res.status(200).json({ success: true, items });
    } catch (err) {
        next(err);
    }
};

export const getRevisionController = async (req, res, next) => {
    try {
        const revision = await revisionService.getRevisionById(req.params.revisionId, req.user);
        if (!revision) throw createError(404, "Revision not found");
        res.status(200).json({ success: true, revision });
    } catch (err) {
        next(err);
    }
};
