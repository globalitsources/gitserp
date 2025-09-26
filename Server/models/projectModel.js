import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  url: {
    type: String,
    required: false,
  },
  backline: {
    type: Number,
    required: false,
  },
  monthlyReport: {
    type: Date,
    required: false
  },
  paused: { type: Boolean, default: false },
  costing: {
    type: mongoose.Decimal128,
    required: false
  }

});

const Project = mongoose.model("Project", projectSchema);
export default Project;
