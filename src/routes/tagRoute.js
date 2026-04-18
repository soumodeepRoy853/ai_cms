import express from "express";
import * as tagController from "../controllers/tagController.js";
import { optionalAuth, requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", optionalAuth, tagController.listTagController);
router.post("/", requireAuth, requireRole("admin", "editor"), tagController.createTagController);
router.put("/:id", requireAuth, requireRole("admin", "editor"), tagController.updateTagController);
router.delete("/:id", requireAuth, requireRole("admin", "editor"), tagController.deleteTagController);

export default router;
