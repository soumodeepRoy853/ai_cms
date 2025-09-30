import * as userServices from "../services/userService.js";
import { loginSchema, registerSchema } from "../validations/userValidation.js";

export const registerController = async(req, res) => {
    try {
        const data = registerSchema.parse(req.body);
        const user = await userServices.registerUser(data);
        res.status(201).json({success: true, user});
    } catch (err) {
        if (err.message.includes("already exists")) {
            return res.status(409).json({ success: false, message: err.message });
        }
        res.status(500).json({success: false, message: "Error registering user"});
    }
};

export const loginController = async(req, res) => {
    try {
        const data = loginSchema.parse(req.body);
        const {user, token} = await userServices.loginUser(data);
        res.status(200).json({success: true, user, token});
    } catch (err) {
        res.status(500).json({success: false, message: "Error logging in user"});
    }
};