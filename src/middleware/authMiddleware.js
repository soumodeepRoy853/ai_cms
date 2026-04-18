import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { createError } from "../utils/httpErrors.js";

const getTokenFromHeader = (req) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) return null;
    return header.split(" ")[1];
};

const hydrateUser = async (userId) => {
    if (!userId) return null;
    return User.findById(userId).select("-password");
};

export const requireAuth = async (req, res, next) => {
    try {
        const token = getTokenFromHeader(req);
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await hydrateUser(decoded.id || decoded.userId);
        } else if (req.session?.userId) {
            req.user = await hydrateUser(req.session.userId);
        }

        if (!req.user) {
            return next(createError(401, "Not authorized"));
        }

        next();
    } catch (err) {
        next(createError(401, "Not authorized"));
    }
};

export const optionalAuth = async (req, res, next) => {
    try {
        const token = getTokenFromHeader(req);
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await hydrateUser(decoded.id || decoded.userId);
        } else if (req.session?.userId) {
            req.user = await hydrateUser(req.session.userId);
        }
        next();
    } catch (err) {
        next();
    }
};

export const requireRole = (...roles) => (req, res, next) => {
    if (!req.user) {
        return next(createError(401, "Not authorized"));
    }
    if (!roles.includes(req.user.role)) {
        return next(createError(403, "Insufficient permissions"));
    }
    next();
};