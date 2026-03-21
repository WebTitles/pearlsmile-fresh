// ============================================================
// backend/models/CustomMedicine.js
// ============================================================
const mongoose = require("mongoose");

const customMedicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    cat:  { type: String, default: "Custom" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomMedicine", customMedicineSchema);
