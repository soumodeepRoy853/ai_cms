import express from "express";
import * as contentController from "../controllers/contentController.js";
import * as revisionController from "../controllers/revisionController.js";
import * as commentController from "../controllers/commentController.js";
import { optionalAuth, requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", optionalAuth, contentController.listContentController);
router.get("/:id", optionalAuth, contentController.getContentController);
router.post("/", requireAuth, requireRole("admin", "editor", "author"), contentController.createContentController);
router.put("/:id", requireAuth, requireRole("admin", "editor", "author"), contentController.updateContentController);
router.delete("/:id", requireAuth, requireRole("admin", "editor", "author"), contentController.deleteContentController);
router.post("/:id/publish", requireAuth, requireRole("admin", "editor"), contentController.publishContentController);
router.get("/:id/revisions", requireAuth, revisionController.listRevisionsController);
router.get("/:id/revisions/:revisionId", requireAuth, revisionController.getRevisionController);
router.get("/:id/comments", optionalAuth, commentController.listCommentsController);
router.post("/:id/comments", requireAuth, commentController.createCommentController);
router.patch("/:id/comments/:commentId/hide", requireAuth, commentController.hideCommentController);
router.delete("/:id/comments/:commentId", requireAuth, commentController.deleteCommentController);

export default router;
