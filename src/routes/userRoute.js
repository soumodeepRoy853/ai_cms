import * as userController from "../controllers/userController.js";
import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", userController.registerController);
router.post("/login", userController.loginController);
router.get("/me", requireAuth, userController.meController);
router.post("/logout", requireAuth, userController.logoutController);

export default router;