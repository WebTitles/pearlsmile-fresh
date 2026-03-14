// ============================================================
// routes/pricing.js
// ============================================================
const express = require("express");
const Settings = require("../models/Settings");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

const DEFAULT_PRICING = [
  { icon: "🦷", name: "Essential Care", price: "Rs. 500", from: true, featured: false, features: ["Oral Examination", "Professional Cleaning", "X-Ray (2 films)", "Cavity Check", "Treatment Plan", "Follow-up Reminder"] },
  { icon: "⭐", name: "Smile Makeover", price: "Rs. 3,500", from: true, featured: true, features: ["Teeth Whitening (1 hr)", "Composite Bonding", "Gum Contouring", "Digital Smile Design", "Post-care Kit", "3-Month Follow-up"] },
  { icon: "💎", name: "Implant Package", price: "Rs. 25,000", from: true, featured: false, features: ["Titanium Implant", "3D Cone Beam CT Scan", "Custom Crown", "Bone Grafting (if needed)", "Lifetime Warranty", "Priority Scheduling"] },
];

// ── GET /api/pricing ──────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const settings = await Settings.findOne({ key: "pricing" });
    const list = settings?.data?.list?.length > 0 ? settings.data.list : DEFAULT_PRICING;
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/pricing ──────────────────────────────────────────
router.put("/", authMiddleware, async (req, res) => {
  try {
    const { list } = req.body;
    if (!Array.isArray(list)) {
      return res.status(400).json({ message: "list must be an array" });
    }
    await Settings.findOneAndUpdate(
      { key: "pricing" },
      { data: { list } },
      { upsert: true, new: true }
    );
    res.json({ message: "Pricing updated successfully", list });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
