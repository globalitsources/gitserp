import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true,
    },
    date: String,
    timeIn: String,
    timeOut: String,
},
    { timestamps: true }
);

const attendanceModel = mongoose.model("Attendance", attendanceSchema);
export default attendanceModel;
