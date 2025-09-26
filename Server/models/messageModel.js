import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            required: true,
        },
        message: { type: String, required: true },
        status: {
            type: String,
            enum: ["sent", "delivered", "seen"],
            default: "sent",
        },
    },
    { timestamps: true }
);

// ✅ Prevent OverwriteModelError during hot reload
const Message =
    mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;
