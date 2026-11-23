import { Router } from "express";
import mongoose from "mongoose";
import Simulation from "../models/Simulation.js";
import { simulateSMTP } from "../services/smtpService.js";

const router = Router();

router.post("/smtp", async (req, res) => {
  const result = simulateSMTP(req.body);
  let saved = false;
  if (mongoose.connection.readyState === 1) {
    try {
      await Simulation.create({
        protocol: "SMTP", sender: req.body.sender, recipient: req.body.recipient,
        subject: req.body.subject, status: result.status, messages: result.messages
      });
      saved = true;
    } catch (e) {
      return res.status(500).json({ message: "Could not save simulation", error: e.message });
    }
  }
  res.json({ ...result, saved });
});

router.get("/history", async (_req, res) => {
  if (mongoose.connection.readyState !== 1) return res.json({ history: [], databaseConnected: false });
  const history = await Simulation.find().sort({ createdAt: -1 }).limit(30);
  res.json({ history, databaseConnected: true });
});

router.get("/mailbox", (_req, res) => {
  res.json({ emails: [
    { id: 1, from: "teacher@college.edu", subject: "Assignment Reminder", body: "Please submit your project before the due date." },
    { id: 2, from: "team@example.com", subject: "Meeting Update", body: "The project discussion is scheduled for tomorrow." },
    { id: 3, from: "library@college.edu", subject: "Library Notice", body: "Your requested book is available." }
  ]});
});

export default router;
