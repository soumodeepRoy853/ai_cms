import express from "express";
import * as categoryController from "../controllers/categoryController.js";
import { optionalAuth, requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", optionalAuth, categoryController.listCategoryController);
router.post("/", requireAuth, requireRole("admin", "editor"), categoryController.createCategoryController);
router.put("/:id", requireAuth, requireRole("admin", "editor"), categoryController.updateCategoryController);
router.delete("/:id", requireAuth, requireRole("admin", "editor"), categoryController.deleteCategoryController);

export default router;
