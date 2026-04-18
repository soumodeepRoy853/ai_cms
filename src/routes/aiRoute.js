import express from "express";
import rateLimit from "express-rate-limit";
import * as aiController from "../controllers/aiController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

const aiLimiter = rateLimit({
    windowMs: Number(process.env.AI_RATE_LIMIT_WINDOW || 15) * 60 * 1000,
    max: Number(process.env.AI_RATE_LIMIT_REQUESTS || 20)
});

router.post("/generate", requireAuth, aiLimiter, aiController.generateContentController);
router.post(
    "/generate-and-save",
    requireAuth,
    requireRole("admin", "editor", "author"),
    aiLimiter,
    aiController.generateAndSaveContentController
);

export default router;
