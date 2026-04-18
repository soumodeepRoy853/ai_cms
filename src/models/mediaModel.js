import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
    originalName: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

const Media = mongoose.models.Media || mongoose.model("Media", mediaSchema);
export default Media;
