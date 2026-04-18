import * as notificationService from "../services/notificationService.js";
import { createError } from "../utils/httpErrors.js";

export const listNotificationsController = async (req, res, next) => {
    try {
        const result = await notificationService.listNotifications(req.user, req.query);
        res.status(200).json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
};

export const markNotificationReadController = async (req, res, next) => {
    try {
        const notification = await notificationService.markNotificationRead(req.params.id, req.user);
        if (!notification) throw createError(404, "Notification not found");
        res.status(200).json({ success: true, notification });
    } catch (err) {
        next(err);
    }
};

export const markAllReadController = async (req, res, next) => {
    try {
        const result = await notificationService.markAllRead(req.user);
        res.status(200).json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
};
