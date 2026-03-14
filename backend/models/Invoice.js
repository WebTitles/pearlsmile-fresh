// ============================================================
// models/Invoice.js
// ============================================================
const mongoose = require("mongoose");

const lineItemSchema = new mongoose.Schema({
  treatment: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true },
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },

    // Patient reference + snapshot
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    patientName: { type: String, required: true },
    patientPhone: { type: String, default: "" },
    patientAge: { type: String, default: "" },
    patientGender: { type: String, default: "" },

    // Doctor
    doctorName: { type: String, default: "" },
    doctorId: { type: String, default: "" },

    // Invoice date
    invoiceDate: { type: String, required: true },

    // Line items
    items: [lineItemSchema],

    // Totals
    subtotal: { type: Number, default: 0 },
    discountType: { type: String, enum: ["flat", "percent"], default: "flat" },
    discountValue: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    gstPercent: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },

    // Payment
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card", "insurance", "other"],
      default: "cash",
    },
    amountPaid: { type: Number, default: 0 },
    amountDue: { type: Number, default: 0 },
    paymentDate: { type: String, default: "" },
    receiptNumber: { type: String, default: "" },
    upiId: { type: String, default: "" },

    // Insurance
    insuranceProvider: { type: String, default: "" },
    insuranceClaimNo: { type: String, default: "" },
    insuranceStatus: {
      type: String,
      enum: ["", "pending", "approved", "rejected"],
      default: "",
    },

    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Invoice", invoiceSchema);
