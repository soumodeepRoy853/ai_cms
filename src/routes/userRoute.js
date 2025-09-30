import * as userController from "../controllers/userController.js";
import express from "express";

const router = express.Router();

router.post("/register", userController.registerController);
router.post("/login", userController.loginController);

export default router;