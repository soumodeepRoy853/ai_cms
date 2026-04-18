import Notification from "../models/notificationModel.js";

export const createNotification = async ({
    userId,
    type,
    title,
    body,
    data,
    createdBy
}) => {
    if (!userId || !type || !title) return null;
    if (createdBy && userId.toString() === createdBy.toString()) return null;

    const notification = new Notification({
        user: userId,
        type,
        title,
        body: body || "",
        data: data || {},
        createdBy: createdBy || undefined
    });
    await notification.save();
    return notification;
};

export const listNotifications = async (user, query) => {
    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.min(Math.max(Number(query.limit || 25), 1), 100);
    const filter = { user: user._id };

    if (query.unread === "true") {
        filter.readAt = { $exists: false };
    }

    const total = await Notification.countDocuments(filter);
    const items = await Notification.find(filter)
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

export const markNotificationRead = async (notificationId, user) => {
    const notification = await Notification.findOne({ _id: notificationId, user: user._id });
    if (!notification) return null;
    if (!notification.readAt) {
        notification.readAt = new Date();
        await notification.save();
    }
    return notification;
};

export const markAllRead = async (user) => {
    await Notification.updateMany({ user: user._id, readAt: { $exists: false } }, { $set: { readAt: new Date() } });
    return { updated: true };
};
