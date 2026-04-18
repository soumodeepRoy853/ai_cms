import multer from "multer";
import path from "path";
import fs from "fs";
import * as crypto from "crypto";
import { createError } from "../utils/httpErrors.js";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedTypes = (process.env.UPLOAD_ALLOWED_TYPES || "image/png,image/jpeg,image/webp,application/pdf").split(",");
const maxBytes = Number(process.env.UPLOAD_MAX_BYTES || 5 * 1024 * 1024);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = `${crypto.randomUUID()}${ext}`;
        cb(null, name);
    }
});

const fileFilter = (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(createError(400, "File type not allowed"));
    }
    cb(null, true);
};

const upload = multer({
    storage,
    limits: { fileSize: maxBytes },
    fileFilter
});

export default upload;
