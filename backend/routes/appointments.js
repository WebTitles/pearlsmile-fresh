// // ============================================================
// // routes/appointments.js
// // ============================================================
// const express = require("express");
// const Appointment = require("../models/Appointment");
// const authMiddleware = require("../middleware/auth");
// const router = express.Router();

// // ── POST /api/appointments ────────────────────────────────────
// // Public — anyone can book an appointment
// router.post("/", async (req, res) => {
//   try {
//     const { name, phone, service, date, time, message } = req.body;
//     if (!name || !phone || !service || !date) {
//       return res.status(400).json({ message: "Name, phone, service, and date are required." });
//     }
//     const appointment = new Appointment({ name, phone, service, date, time, message });
//     await appointment.save();
//     res.status(201).json({ message: "Appointment booked successfully!", appointment });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ── GET /api/appointments ─────────────────────────────────────
// // Protected — only doctors can view appointments
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     const appointments = await Appointment.find().sort({ createdAt: -1 });
//     res.json(appointments);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;

// ============================================================
// routes/appointments.js
// ============================================================
const express = require("express");
const Appointment = require("../models/Appointment");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// ── POST /api/appointments ────────────────────────────────────
// Public — anyone can book an appointment
router.post("/", async (req, res) => {
  try {
    const { name, phone, service, date, time, message } = req.body;
    if (!name || !phone || !service || !date) {
      return res
        .status(400)
        .json({ message: "Name, phone, service, and date are required." });
    }
    const appointment = new Appointment({
      name,
      phone,
      service,
      date,
      time,
      message,
    });
    await appointment.save();
    res
      .status(201)
      .json({ message: "Appointment booked successfully!", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/appointments ─────────────────────────────────────
// Protected — only doctors can view appointments
router.get("/", authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({
      date: 1,
      time: 1,
      createdAt: -1,
    });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/appointments/:id/status ───────────────────────
// Protected — update appointment status
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "completed", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }
    const appt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!appt)
      return res.status(404).json({ message: "Appointment not found." });
    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/appointments/:id ──────────────────────────────
// Protected — delete appointment
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndDelete(req.params.id);
    if (!appt)
      return res.status(404).json({ message: "Appointment not found." });
    res.json({ message: "Appointment deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
