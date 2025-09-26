import mongoose from "mongoose";

const querySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            required: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: ["pending", "executed"],
            default: "pending"
        }
    },
    { timestamps: true }
);

export default mongoose.model("Query", querySchema);
