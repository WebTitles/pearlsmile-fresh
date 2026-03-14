// ============================================================
// models/Patient.js
// ============================================================
const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
    visitDate: { type: String, required: true },
    visitTime: { type: String, default: "" },
    service: { type: String, required: true },
    amount: { type: String, default: "" },
    doctor: { type: String, default: "" },
    toothNumbers: { type: String, default: "" },
    notes: { type: String, default: "" },
    medicines: { type: String, default: "" },
    nextVisitDate: { type: String, default: "" },
    prescription: {
      medicineRows: { type: Array, default: [] },
    },
  },
  { timestamps: true }
);

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true },
    age: { type: String, default: "" },
    gender: { type: String, default: "" },
    blood: { type: String, default: "" },
    visitCount: { type: Number, default: 0 },
    visits: [visitSchema],
  },
  { timestamps: true }
);

// Auto-update visitCount before saving
patientSchema.pre("save", function (next) {
  this.visitCount = this.visits.length;
  next();
});

module.exports = mongoose.model("Patient", patientSchema);
