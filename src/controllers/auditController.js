import * as auditService from "../services/auditService.js";

export const listAuditLogsController = async (req, res, next) => {
    try {
        const result = await auditService.listAuditLogs(req.query);
        res.status(200).json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
};

export const listActivityController = async (req, res, next) => {
    try {
        const result = await auditService.listActivityForUser(req.user, req.query);
        res.status(200).json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
};
