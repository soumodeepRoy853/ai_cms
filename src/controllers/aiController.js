import * as aiService from "../services/aiService.js";
import { generateAndSaveSchema, generateContentSchema } from "../validations/aiValidation.js";

export const generateContentController = async (req, res, next) => {
    try {
        const data = generateContentSchema.parse(req.body);
        const result = await aiService.generateContent(data, req.user);
        res.status(200).json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
};

export const generateAndSaveContentController = async (req, res, next) => {
    try {
        const data = generateAndSaveSchema.parse(req.body);
        const result = await aiService.generateAndSaveContent(data, req.user);
        res.status(201).json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
};
