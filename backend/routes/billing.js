// ============================================================
// routes/billing.js
// ============================================================
const express = require("express");
const Invoice = require("../models/Invoice");
const Patient = require("../models/Patient");
const auth = require("../middleware/auth");
const router = express.Router();

// All billing routes require login
router.use(auth);

// ── Helper: generate invoice number ──────────────────────────
async function nextInvoiceNumber() {
  const last = await Invoice.findOne()
    .sort({ createdAt: -1 })
    .select("invoiceNumber");
  if (!last || !last.invoiceNumber) return "INV-0001";
  const num = parseInt(
    (last.invoiceNumber || "INV-0000").split("-")[1] || "0",
    10,
  );
  return "INV-" + String(num + 1).padStart(4, "0");
}

// ── GET /api/billing  — all invoices, newest first ───────────
router.get("/", async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/billing/patients — patients list for picker ─────
router.get("/patients", async (req, res) => {
  try {
    const patients = await Patient.find()
      .select("name mobile email age gender blood visits")
      .sort({ name: 1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/billing/summary — financial summary ─────────────
router.get("/summary", async (req, res) => {
  try {
    const invoices = await Invoice.find();

    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const weekAgo = new Date(now - 7 * 86400000).toISOString().split("T")[0];

    const totalRevenue = invoices.reduce((s, i) => s + (i.amountPaid || 0), 0);
    const totalOutstanding = invoices.reduce(
      (s, i) => s + (i.amountDue || 0),
      0,
    );
    const dailyRevenue = invoices
      .filter((i) => i.invoiceDate === today)
      .reduce((s, i) => s + (i.amountPaid || 0), 0);
    const weeklyRevenue = invoices
      .filter((i) => i.invoiceDate >= weekAgo)
      .reduce((s, i) => s + (i.amountPaid || 0), 0);
    const monthlyRevenue = invoices
      .filter((i) => (i.invoiceDate || "").startsWith(`${y}-${m}`))
      .reduce((s, i) => s + (i.amountPaid || 0), 0);

    const unpaidCount = invoices.filter(
      (i) => i.paymentStatus === "unpaid",
    ).length;
    const partialCount = invoices.filter(
      (i) => i.paymentStatus === "partial",
    ).length;
    const paidCount = invoices.filter((i) => i.paymentStatus === "paid").length;

    // Top services
    const serviceMap = {};
    invoices.forEach((inv) => {
      (inv.items || []).forEach((item) => {
        serviceMap[item.treatment] =
          (serviceMap[item.treatment] || 0) + item.amount;
      });
    });
    const topServices = Object.entries(serviceMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));

    res.json({
      totalRevenue,
      totalOutstanding,
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
      unpaidCount,
      partialCount,
      paidCount,
      totalInvoices: invoices.length,
      topServices,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/billing/:id ──────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/billing — create invoice ───────────────────────
router.post("/", async (req, res) => {
  try {
    const invoiceNumber = await nextInvoiceNumber();
    const invoice = new Invoice({ invoiceNumber, ...req.body });
    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/billing/:id — update invoice ────────────────────
router.put("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/billing/:id/payment — update payment only ─────
router.patch("/:id/payment", async (req, res) => {
  try {
    const {
      amountPaid,
      paymentMethod,
      paymentDate,
      receiptNumber,
      paymentStatus,
    } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    if (amountPaid !== undefined) invoice.amountPaid = amountPaid;
    if (paymentMethod) invoice.paymentMethod = paymentMethod;
    if (paymentDate) invoice.paymentDate = paymentDate;
    if (receiptNumber) invoice.receiptNumber = receiptNumber;
    if (paymentStatus) invoice.paymentStatus = paymentStatus;
    invoice.amountDue = Math.max(
      0,
      (invoice.totalAmount || 0) - (invoice.amountPaid || 0),
    );

    await invoice.save();
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/billing/:id ───────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
