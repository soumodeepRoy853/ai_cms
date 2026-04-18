import express from "express";
import * as notificationController from "../controllers/notificationController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, notificationController.listNotificationsController);
router.post("/read-all", requireAuth, notificationController.markAllReadController);
router.post("/:id/read", requireAuth, notificationController.markNotificationReadController);

export default router;
