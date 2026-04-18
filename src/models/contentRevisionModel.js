import mongoose from "mongoose";

const contentRevisionSchema = new mongoose.Schema({
    content: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Content",
        required: true,
        index: true
    },
    version: {
        type: Number,
        required: true
    },
    title: String,
    slug: String,
    type: String,
    status: String,
    excerpt: String,
    body: String,
    tags: [String],
    tagRefs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    category: String,
    categoryRef: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    coverImage: String,
    seo: {
        title: String,
        description: String
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reason: String
}, { timestamps: true });

contentRevisionSchema.index({ content: 1, version: 1 }, { unique: true });

const ContentRevision = mongoose.models.ContentRevision || mongoose.model("ContentRevision", contentRevisionSchema);
export default ContentRevision;
