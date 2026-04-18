import express from "express";
import * as mediaController from "../controllers/mediaController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/upload", requireAuth, upload.single("file"), mediaController.uploadMediaController);

export default router;
