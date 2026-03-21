// ============================================================
// backend/routes/custommeds.js
// ============================================================
const express        = require("express");
const CustomMedicine = require("../models/CustomMedicine");
const authMiddleware = require("../middleware/auth");
const router         = express.Router();

// GET /api/custommeds — protected — get all custom medicines
router.get("/", authMiddleware, async (req, res) => {
  try {
    const meds = await CustomMedicine.find({}).sort({ createdAt: -1 });
    res.json(meds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/custommeds — protected — add a new custom medicine
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, cat } = req.body;
    if (!name || name.trim().length < 2)
      return res.status(400).json({ message: "Medicine name too short." });

    // Check duplicate (case-insensitive)
    const existing = await CustomMedicine.findOne({
      name: { $regex: new RegExp("^" + name.trim().replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + "$", "i") },
    });
    if (existing) return res.json(existing); // already exists — return it silently

    const med = new CustomMedicine({ name: name.trim(), cat: cat || "Custom" });
    await med.save();
    res.status(201).json(med);
  } catch (err) {
    // Duplicate key error
    if (err.code === 11000) return res.json({ message: "Already exists" });
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
