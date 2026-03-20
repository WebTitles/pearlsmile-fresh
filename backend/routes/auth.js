// const express = require("express");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const Doctor = require("../models/Doctor");
// const router = express.Router();
// const JWT_SECRET = process.env.JWT_SECRET || "pearlsmile_secret";

// // POST /api/auth/login
// router.post("/login", async (req, res) => {
//   try {
//     const { doctorId, password } = req.body;
//     if (!doctorId || !password) return res.status(400).json({ message: "Doctor ID and password are required." });
//     const doctor = await Doctor.findOne({ doctorId: doctorId.trim() });
//     if (!doctor) return res.status(401).json({ message: "Incorrect credentials. Please try again." });
//     const isMatch = await doctor.comparePassword(password);
//     if (!isMatch) return res.status(401).json({ message: "Incorrect credentials. Please try again." });
//     const token = jwt.sign(
//       { id: doctor._id, doctorId: doctor.doctorId, name: doctor.name, specialty: doctor.specialty },
//       JWT_SECRET, { expiresIn: "8h" }
//     );
//     res.json({ token, doctor: { id: doctor._id, doctorId: doctor.doctorId, name: doctor.name, specialty: doctor.specialty } });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

// // GET /api/auth/seed-doctors  ← GET so you can open it in browser
// router.get("/seed-doctors", async (req, res) => {
//   try {
//     const existingCount = await Doctor.countDocuments();
//     if (existingCount > 0) return res.json({ message: "✅ Doctors already seeded. Count: " + existingCount });
//     const defaultDoctors = [
//       { doctorId: "doctor001", name: "Dr. Arjun Sharma", specialty: "Chief Dental Surgeon", password: "PearlSmile@2025" },
//       { doctorId: "drpriya",   name: "Dr. Priya Nair",   specialty: "Cosmetic Dentist",      password: "Priya@Smile123" },
//       { doctorId: "drrahul",   name: "Dr. Rahul Verma",  specialty: "Orthodontist",           password: "Rahul@Dental99" },
//     ];
//     for (const d of defaultDoctors) { const doc = new Doctor(d); await doc.save(); }
//     res.json({ message: "✅ 3 doctors seeded successfully!", doctors: defaultDoctors.map(d => ({ doctorId: d.doctorId, password: d.password })) });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // POST /api/auth/seed-doctors (also support POST)
// router.post("/seed-doctors", async (req, res) => {
//   try {
//     const existingCount = await Doctor.countDocuments();
//     if (existingCount > 0) return res.json({ message: "✅ Doctors already seeded. Count: " + existingCount });
//     const defaultDoctors = [
//       { doctorId: "doctor001", name: "Dr. Arjun Sharma", specialty: "Chief Dental Surgeon", password: "PearlSmile@2025" },
//       { doctorId: "drpriya",   name: "Dr. Priya Nair",   specialty: "Cosmetic Dentist",      password: "Priya@Smile123" },
//       { doctorId: "drrahul",   name: "Dr. Rahul Verma",  specialty: "Orthodontist",           password: "Rahul@Dental99" },
//     ];
//     for (const d of defaultDoctors) { const doc = new Doctor(d); await doc.save(); }
//     res.json({ message: "✅ 3 doctors seeded successfully!" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// const authMiddleware = require("../middleware/auth");
// router.get("/me", authMiddleware, async (req, res) => {
//   try {
//     const doctor = await Doctor.findById(req.doctor.id).select("-password");
//     if (!doctor) return res.status(404).json({ message: "Doctor not found" });
//     res.json(doctor);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;



// ============================================================
// routes/auth.js
// ============================================================
const express       = require("express");
const jwt           = require("jsonwebtoken");
const bcrypt        = require("bcryptjs");
const Doctor        = require("../models/Doctor");
const authMiddleware= require("../middleware/auth");
const router        = express.Router();
const JWT_SECRET    = process.env.JWT_SECRET || "pearlsmile_secret";

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { doctorId, password } = req.body;
    if (!doctorId || !password)
      return res.status(400).json({ message: "Doctor ID and password are required." });
    const doctor = await Doctor.findOne({ doctorId: doctorId.trim() });
    if (!doctor)
      return res.status(401).json({ message: "Incorrect credentials. Please try again." });
    const isMatch = await doctor.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Incorrect credentials. Please try again." });
    const token = jwt.sign(
      { id: doctor._id, doctorId: doctor.doctorId, name: doctor.name, specialty: doctor.specialty },
      JWT_SECRET,
      { expiresIn: "8h" }
    );
    res.json({
      token,
      doctor: {
        id:          doctor._id,
        doctorId:    doctor.doctorId,
        name:        doctor.name,
        specialty:   doctor.specialty,
        isAvailable: doctor.isAvailable,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/auth/seed-doctors
router.get("/seed-doctors", async (req, res) => {
  try {
    const existingCount = await Doctor.countDocuments();
    if (existingCount > 0)
      return res.json({ message: "✅ Doctors already seeded. Count: " + existingCount });
    const defaultDoctors = [
      { doctorId: "doctor001", name: "Dr. Arjun Sharma", specialty: "Chief Dental Surgeon", password: "PearlSmile@2025", isAvailable: true },
      { doctorId: "drpriya",   name: "Dr. Priya Nair",   specialty: "Cosmetic Dentist",      password: "Priya@Smile123",  isAvailable: true },
      { doctorId: "drrahul",   name: "Dr. Rahul Verma",  specialty: "Orthodontist",           password: "Rahul@Dental99",  isAvailable: true },
    ];
    for (const d of defaultDoctors) {
      const doc = new Doctor(d);
      await doc.save();
    }
    res.json({
      message: "✅ 3 doctors seeded successfully!",
      doctors: defaultDoctors.map(d => ({ doctorId: d.doctorId, password: d.password })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/seed-doctors
router.post("/seed-doctors", async (req, res) => {
  try {
    const existingCount = await Doctor.countDocuments();
    if (existingCount > 0)
      return res.json({ message: "✅ Doctors already seeded. Count: " + existingCount });
    const defaultDoctors = [
      { doctorId: "doctor001", name: "Dr. Arjun Sharma", specialty: "Chief Dental Surgeon", password: "PearlSmile@2025", isAvailable: true },
      { doctorId: "drpriya",   name: "Dr. Priya Nair",   specialty: "Cosmetic Dentist",      password: "Priya@Smile123",  isAvailable: true },
      { doctorId: "drrahul",   name: "Dr. Rahul Verma",  specialty: "Orthodontist",           password: "Rahul@Dental99",  isAvailable: true },
    ];
    for (const d of defaultDoctors) {
      const doc = new Doctor(d);
      await doc.save();
    }
    res.json({ message: "✅ 3 doctors seeded successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.doctor.id).select("-password");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/doctors — public: get all doctors with availability
router.get("/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find({}).select("-password").sort({ name: 1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/auth/doctors/:id/availability — protected: toggle availability
router.patch("/doctors/:id/availability", authMiddleware, async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isAvailable },
      { new: true }
    ).select("-password");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
