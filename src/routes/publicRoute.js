import express from "express";
import * as publicContentController from "../controllers/publicContentController.js";

const router = express.Router();

router.get("/content", publicContentController.listPublicContentController);
router.get("/content/:slug", publicContentController.getPublicContentController);

export default router;
