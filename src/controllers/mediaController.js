import * as mediaService from "../services/mediaService.js";

export const uploadMediaController = async (req, res, next) => {
    try {
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const media = await mediaService.createMedia(req.file, req.user, baseUrl);
        res.status(201).json({ success: true, media });
    } catch (err) {
        next(err);
    }
};
