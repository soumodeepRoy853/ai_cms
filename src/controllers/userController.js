import * as userServices from "../services/userService.js";
import { loginSchema, registerSchema } from "../validations/userValidation.js";

export const registerController = async(req, res, next) => {
    try {
        const data = registerSchema.parse(req.body);
        const user = await userServices.registerUser(data);
        res.status(201).json({ success: true, user });
    } catch (err) {
        next(err);
    }
};

export const loginController = async(req, res, next) => {
    try {
        const data = loginSchema.parse(req.body);
        const { user, token } = await userServices.loginUser(data);
        if (req.session) {
            req.session.userId = user._id;
            req.session.role = user.role;
        }
        res.status(200).json({ success: true, user, token });
    } catch (err) {
        next(err);
    }
};

export const logoutController = async (req, res) => {
    if (!req.session) {
        return res.status(200).json({ success: true });
    }
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.status(200).json({ success: true });
    });
};

export const meController = async (req, res, next) => {
    try {
        const user = await userServices.getUserById(req.user._id);
        res.status(200).json({ success: true, user });
    } catch (err) {
        next(err);
    }
};