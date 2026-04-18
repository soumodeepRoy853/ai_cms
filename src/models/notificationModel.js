import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        default: ""
    },
    data: {
        type: Object,
        default: {}
    },
    readAt: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
export default Notification;
