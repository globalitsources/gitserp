import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema({
  from: { type: Date, required: true },
  to: { type: Date, required: true },
  name: { type: String, default: "Holiday" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
});

holidaySchema.index({ from: 1, to: 1 }, { unique: true });

export default mongoose.model("Holiday", holidaySchema);
