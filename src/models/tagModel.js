import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    description: {
        type: String,
        default: ""
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

const Tag = mongoose.models.Tag || mongoose.model("Tag", tagSchema);
export default Tag;
