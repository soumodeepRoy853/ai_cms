import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    type: {
        type: String,
        enum: ["article", "page", "snippet"],
        default: "article"
    },
    status: {
        type: String,
        enum: ["draft", "review", "published", "archived"],
        default: "draft"
    },
    excerpt: {
        type: String,
        default: ""
    },
    body: {
        type: String,
        required: true
    },
    tags: [{ type: String }],
    tagRefs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag"
    }],
    category: {
        type: String
    },
    categoryRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    coverImage: {
        type: String
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    seo: {
        title: String,
        description: String
    },
    aiMeta: {
        createdFrom: {
            type: String,
            enum: ["manual", "ai"],
            default: "manual"
        },
        model: String,
        prompt: String,
        promptTokens: Number,
        completionTokens: Number,
        totalTokens: Number
    },
    publishedAt: Date
}, { timestamps: true });

contentSchema.index({ title: "text", excerpt: "text", body: "text", tags: "text", category: "text" });

const Content = mongoose.models.Content || mongoose.model("Content", contentSchema);
export default Content;
