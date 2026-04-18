import { GoogleGenerativeAI } from "@google/generative-ai";
import AiGeneration from "../models/aiGenerationModel.js";
import Content from "../models/contentModel.js";
import { createContent } from "../services/contentService.js";
import { createError } from "../utils/httpErrors.js";

let client;

const getClient = () => {
    if (!client) {
        client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return client;
};

const buildPrompt = (payload) => {
    const parts = [];
    if (payload.title) parts.push(`Title: ${payload.title}`);
    if (payload.contentType) parts.push(`Content type: ${payload.contentType}`);
    if (payload.tone) parts.push(`Tone: ${payload.tone}`);
    if (payload.length) parts.push(`Length: ${payload.length}`);
    if (payload.keywords && payload.keywords.length) {
        parts.push(`Keywords: ${payload.keywords.join(", ")}`);
    }
    parts.push(`Instructions: ${payload.prompt}`);
    return parts.join("\n");
};

const buildExcerpt = (text) => {
    if (!text) return "";
    const normalized = text.replace(/\s+/g, " ").trim();
    if (normalized.length <= 200) return normalized;
    return `${normalized.slice(0, 197)}...`;
};

const ensureApiKey = () => {
    if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_API_KEY.trim()) {
        throw createError(500, "Gemini API key not configured");
    }
};

const ensureLinkedContent = async (linkedContentId) => {
    if (!linkedContentId) return;
    const contentExists = await Content.exists({ _id: linkedContentId });
    if (!contentExists) throw createError(404, "Linked content not found");
};

const runGeneration = async (payload) => {
    ensureApiKey();
    await ensureLinkedContent(payload.linkedContentId);

    const modelName = payload.model || process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const temperature = payload.temperature ?? 0.7;
    const maxOutputTokens = payload.maxOutputTokens ?? 800;
    const input = buildPrompt(payload);

    const gemini = getClient();
    const model = gemini.getGenerativeModel({ model: modelName });
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: input }] }],
        generationConfig: {
            temperature,
            maxOutputTokens
        }
    });

    const response = result.response;
    const outputText = response.text();
    if (!outputText) {
        throw createError(500, "AI generation returned no content");
    }

    const usage = response.usageMetadata ? {
        promptTokens: response.usageMetadata.promptTokenCount,
        completionTokens: response.usageMetadata.candidatesTokenCount,
        totalTokens: response.usageMetadata.totalTokenCount
    } : undefined;

    return {
        input,
        outputText,
        modelName,
        temperature,
        maxOutputTokens,
        usage
    };
};

export const generateContent = async (payload, user) => {
    if (!user) throw createError(401, "Not authorized");
    const generation = await runGeneration(payload);

    const record = new AiGeneration({
        prompt: generation.input,
        output: generation.outputText,
        model: generation.modelName,
        temperature: generation.temperature,
        maxOutputTokens: generation.maxOutputTokens,
        usage: generation.usage,
        createdBy: user._id,
        linkedContent: payload.linkedContentId || undefined
    });
    await record.save();

    return {
        generationId: record._id,
        output: generation.outputText,
        model: generation.modelName,
        usage: generation.usage
    };
};

export const generateAndSaveContent = async (payload, user) => {
    if (!user) throw createError(401, "Not authorized");

    const generation = await runGeneration(payload);

    const restrictedPublishRoles = ["admin", "editor"];
    if (payload.status === "published" && !restrictedPublishRoles.includes(user.role)) {
        throw createError(403, "Not authorized to publish content");
    }

    const contentPayload = {
        title: payload.title || `AI Draft ${new Date().toISOString()}`,
        type: payload.contentType || payload.type,
        status: payload.status || "draft",
        excerpt: payload.excerpt || buildExcerpt(generation.outputText),
        body: generation.outputText,
        tags: payload.tags,
        category: payload.category,
        coverImage: payload.coverImage,
        seo: payload.seo,
        aiMeta: {
            createdFrom: "ai",
            model: generation.modelName,
            prompt: generation.input,
            promptTokens: generation.usage?.promptTokens,
            completionTokens: generation.usage?.completionTokens,
            totalTokens: generation.usage?.totalTokens
        }
    };

    const content = await createContent(contentPayload, user);

    const record = new AiGeneration({
        prompt: generation.input,
        output: generation.outputText,
        model: generation.modelName,
        temperature: generation.temperature,
        maxOutputTokens: generation.maxOutputTokens,
        usage: generation.usage,
        createdBy: user._id,
        linkedContent: content._id
    });
    await record.save();

    return {
        generationId: record._id,
        content,
        output: generation.outputText,
        model: generation.modelName,
        usage: generation.usage
    };
};
