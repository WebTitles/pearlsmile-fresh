// ============================================================
// routes/services.js
// ============================================================
const express = require("express");
const Settings = require("../models/Settings");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

const DEFAULT_SERVICES = [
  { icon: "🦷", name: "General Dentistry & Cleaning", desc: "Comprehensive oral examinations, professional cleanings, cavity detection, and preventive care for lasting dental health.", price: "Rs. 500", from: true },
  { icon: "✨", name: "Cosmetic Dentistry & Smile Makeover", desc: "Transform your smile with veneers, bonding, whitening, and complete makeover packages designed to perfection.", price: "Rs. 3,500", from: true },
  { icon: "🔩", name: "Dental Implants", desc: "Permanent tooth replacements using titanium implants — the gold standard for missing teeth, built to last decades.", price: "Rs. 25,000", from: true },
  { icon: "📐", name: "Orthodontics & Invisalign", desc: "Traditional braces and clear aligner solutions to straighten teeth and correct bite issues at any age.", price: "Rs. 18,000", from: true },
  { icon: "💉", name: "Root Canal Therapy", desc: "Painless, single-appointment root canal treatments using rotary endodontics and advanced anesthesia techniques.", price: "Rs. 4,000", from: true },
  { icon: "👶", name: "Pediatric Dentistry", desc: "Gentle, child-friendly dental care from infancy through adolescence in our specially designed kids' suite.", price: "Rs. 400", from: true },
];

// ── GET /api/services ─────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const settings = await Settings.findOne({ key: "services" });
    const list = settings?.data?.list?.length > 0 ? settings.data.list : DEFAULT_SERVICES;
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/services ─────────────────────────────────────────
router.put("/", authMiddleware, async (req, res) => {
  try {
    const { list } = req.body;
    if (!Array.isArray(list)) {
      return res.status(400).json({ message: "list must be an array" });
    }
    await Settings.findOneAndUpdate(
      { key: "services" },
      { data: { list } },
      { upsert: true, new: true }
    );
    res.json({ message: "Services updated successfully", list });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
