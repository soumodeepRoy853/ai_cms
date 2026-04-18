import express from "express";
import * as auditController from "../controllers/auditController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/audit", requireAuth, requireRole("admin"), auditController.listAuditLogsController);
router.get("/activity", requireAuth, auditController.listActivityController);

export default router;
