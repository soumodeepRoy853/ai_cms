import express from "express";
import * as reviewController from "../controllers/reviewController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/assign", requireAuth, requireRole("admin", "editor"), reviewController.assignReviewController);
router.get("/assigned", requireAuth, reviewController.listAssignedReviewsController);
router.get("/content/:contentId", requireAuth, requireRole("admin", "editor"), reviewController.listContentReviewsController);
router.post("/:id/decision", requireAuth, requireRole("reviewer", "editor", "admin"), reviewController.reviewDecisionController);

export default router;
