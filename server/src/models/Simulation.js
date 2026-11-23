import mongoose from "mongoose";

const SimulationSchema = new mongoose.Schema({
  protocol: { type: String, required: true },
  sender: String,
  recipient: String,
  subject: String,
  status: { type: String, required: true },
  messages: [{ command: String, response: String, accepted: Boolean }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Simulation", SimulationSchema);
