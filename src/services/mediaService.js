import Media from "../models/mediaModel.js";
import { createError } from "../utils/httpErrors.js";

export const createMedia = async (file, user, baseUrl) => {
    if (!user) throw createError(401, "Not authorized");
    if (!file) throw createError(400, "File is required");

    const url = `${baseUrl}/uploads/${file.filename}`;

    const media = new Media({
        originalName: file.originalname,
        fileName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        url,
        uploader: user._id
    });

    await media.save();
    return media;
};
