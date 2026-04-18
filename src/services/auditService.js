import AuditLog from "../models/auditLogModel.js";

export const recordAudit = async ({
    action,
    entityType,
    entityId,
    actor,
    meta,
    req
}) => {
    if (!actor || !entityType || !entityId || !action) return null;

    const log = new AuditLog({
        actor,
        action,
        entityType,
        entityId,
        meta: meta || {},
        ip: req?.ip,
        userAgent: req?.get?.("user-agent")
    });
    await log.save();
    return log;
};

const buildFilters = (query) => {
    const filter = {};
    if (query.actor) filter.actor = query.actor;
    if (query.entityType) filter.entityType = query.entityType;
    if (query.entityId) filter.entityId = query.entityId;
    if (query.action) filter.action = query.action;
    return filter;
};

export const listAuditLogs = async (query) => {
    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.min(Math.max(Number(query.limit || 50), 1), 200);
    const filter = buildFilters(query);

    const total = await AuditLog.countDocuments(filter);
    const items = await AuditLog.find(filter)
        .populate("actor", "userName email role")
        .sort({ createdAt: -1 })
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

export const listActivityForUser = async (user, query) => {
    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.min(Math.max(Number(query.limit || 25), 1), 100);
    const filter = buildFilters(query);
    filter.actor = user._id;

    const total = await AuditLog.countDocuments(filter);
    const items = await AuditLog.find(filter)
        .sort({ createdAt: -1 })
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
