import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    action: {
        type: String,
        required: true,
        index: true
    },
    entityType: {
        type: String,
        required: true,
        index: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    meta: {
        type: Object,
        default: {}
    },
    ip: String,
    userAgent: String
}, { timestamps: true });

const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
