import mongoose, { mongo, Schema } from "mongoose";
const clipboardItemSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    room: {
        type: String,
        required: true,
        index: true,
    },
    senderId: {
        type: String,
        required: true,
    },
    senderUsername: {
        type: String,
        required: true,
    },
    senderDeviceInfo: {
        type: String,
        required: true,
    },
}, { timestamps: true });
export const ClipboardItem = mongoose.model("ClipboardItem", clipboardItemSchema);
//# sourceMappingURL=clipboard.model.js.map