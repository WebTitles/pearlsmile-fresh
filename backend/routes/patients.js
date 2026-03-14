// ============================================================
// routes/patients.js
// ============================================================
const express = require("express");
const Patient = require("../models/Patient");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// All patient routes are protected
router.use(authMiddleware);

// ── GET /api/patients ─────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find()
      .select("-visits")
      .sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/patients ────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { name, mobile, email, age, gender, blood } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Patient name is required." });
    }
    if (!mobile || !mobile.trim()) {
      return res.status(400).json({ message: "Mobile number is required." });
    }
    const patient = new Patient({ name: name.trim(), mobile: mobile.trim(), email, age, gender, blood });
    await patient.save();
    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/patients/:id ─────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/patients/:id ──────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: "Patient deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/patients/:id/visits ────────────────────────────
router.post("/:id/visits", async (req, res) => {
  try {
    const { visitDate, visitTime, service, amount, doctor, toothNumbers, notes, medicines, nextVisitDate, prescription } = req.body;

    if (!visitDate || !service) {
      return res.status(400).json({ message: "Visit date and service are required." });
    }

    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    patient.visits.unshift({
      visitDate,
      visitTime,
      service,
      amount,
      doctor,
      toothNumbers,
      notes,
      medicines,
      nextVisitDate,
      prescription: prescription || { medicineRows: [] },
    });

    await patient.save();
    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/patients/:id/visits/:visitId ──────────────────
router.delete("/:id/visits/:visitId", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    patient.visits = patient.visits.filter(
      (v) => v._id.toString() !== req.params.visitId
    );

    await patient.save();
    res.json({ message: "Visit deleted", patient });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
