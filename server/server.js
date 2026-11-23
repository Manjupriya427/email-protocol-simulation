import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import simulationRoutes from "./src/routes/simulationRoutes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok", message: "Email simulation API is running" }));
app.use("/api", simulationRoutes);

const PORT = process.env.PORT || 5000;
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection failed:", err.message));
}
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
