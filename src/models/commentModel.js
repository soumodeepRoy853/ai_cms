import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    content: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Content",
        required: true,
        index: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    body: {
        type: String,
        required: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    },
    status: {
        type: String,
        enum: ["visible", "hidden", "deleted"],
        default: "visible",
        index: true
    }
}, { timestamps: true });

const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);
export default Comment;
