import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/httpErrors.js";

const toSafeUser = (user) => {
        const safeUser = user.toObject();
        delete safeUser.password;
        return safeUser;
};

export const registerUser = async(userData) => {
    try {
    const {userName, email, phone, password, role} = userData || {};
       if (!userName) throw createError(400, "User name is required");
       if (!email) throw createError(400, "Email is required");
       if (!phone) throw createError(400, "Phone number is required");
       if (!password) throw createError(400, "Password is required");

       const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
       if (existingUser) {
           throw createError(409, "User already exists");
       }

    const allowRole = process.env.ALLOW_ROLE_ON_REGISTER === "true";
    const newUser = new User({ userName, email, phone, password, role: allowRole ? role : undefined });
       await newUser.save();
       return toSafeUser(newUser);
    } catch (err) {
        throw createError(err.status || 400, err.message || "Error creating new user");
    }
};

export const loginUser = async(loginData) => {
    try {
        const {email, password} = loginData || {};
        if (!email) throw createError(400, "Email is required");
        if (!password) throw createError(400, "Password is required");

        const user = await User.findOne({ email });
        if(!user){
            throw createError(400, "User does not exist");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            throw createError(400, "Invalid credentials");
        };
        const token = user.generateJWT();
        return { user: toSafeUser(user), token };
    } catch (err) {
        throw createError(err.status || 400, err.message || "Error logging in user");
    }
};

export const getUserById = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw createError(404, "User not found");
    }
    return toSafeUser(user);
};