import mongoose from "mongoose";

const aiGenerationSchema = new mongoose.Schema({
    prompt: {
        type: String,
        required: true
    },
    output: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    temperature: Number,
    maxOutputTokens: Number,
    usage: {
        promptTokens: Number,
        completionTokens: Number,
        totalTokens: Number
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    linkedContent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Content"
    }
}, { timestamps: true });

const AiGeneration = mongoose.models.AiGeneration || mongoose.model("AiGeneration", aiGenerationSchema);
export default AiGeneration;
