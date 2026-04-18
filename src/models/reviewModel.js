import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    content: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Content",
        required: true,
        index: true
    },
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["assigned", "approved", "rejected", "changes_requested"],
        default: "assigned",
        index: true
    },
    notes: {
        type: String,
        default: ""
    },
    assignedAt: {
        type: Date,
        default: Date.now
    },
    reviewedAt: Date,
    dueAt: Date
}, { timestamps: true });

reviewSchema.index({ content: 1, reviewer: 1 }, { unique: true });

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
export default Review;
