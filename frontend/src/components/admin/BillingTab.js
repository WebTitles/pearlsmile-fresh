// ============================================================
// src/components/admin/BillingTab.js
// ============================================================
import React, { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";

// ── same months array as PatientsTab ─────────────────────────
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DENTAL_TREATMENTS = [
  "General Checkup & Cleaning",
  "Teeth Whitening",
  "Dental Implant",
  "Root Canal Therapy",
  "Crown / Cap",
  "Bridge",
  "Orthodontic Treatment (Braces)",
  "Invisalign",
  "Tooth Extraction",
  "Wisdom Tooth Removal",
  "Composite Filling",
  "Amalgam Filling",
  "Dental X-Ray",
  "Scaling & Polishing",
  "Gum Treatment (Periodontics)",
  "Smile Makeover",
  "Veneer",
  "Pediatric Dentistry",
  "Fluoride Treatment",
  "Mouthguard / Night Guard",
  "Consultation Fee",
  "Follow-Up Visit",
  "Oral Surgery",
  "Jaw Treatment (TMJ)",
  "Emergency Dental Care",
];

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "insurance", label: "Insurance" },
  { value: "other", label: "Other" },
];

const STATUS_CFG = {
  paid: { label: "Paid", color: "#16a34a", bg: "#f0fdf4" },
  partial: { label: "Partial", color: "#d97706", bg: "#fffbeb" },
  unpaid: { label: "Unpaid", color: "#dc2626", bg: "#fef2f2" },
};

const TBL_HEADERS = ["Treatment", "Qty", "Rate (Rs.)", "Amount", ""];

// ── helpers ───────────────────────────────────────────────────
function fmtMoney(n) {
  return (
    "Rs. " +
    Number(n || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}
function todayISO() {
  return new Date().toISOString().split("T")[0];
}
function friendlyDate(d) {
  if (!d) return "--";
  const dt = new Date(d + "T00:00:00");
  if (isNaN(dt.getTime())) return d;
  return dt.getDate() + " " + MONTHS[dt.getMonth()] + " " + dt.getFullYear();
}
function calcTotals(items, discountType, discountValue, gstPercent) {
  const sub = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const disc =
    discountType === "percent"
      ? (sub * (parseFloat(discountValue) || 0)) / 100
      : parseFloat(discountValue) || 0;
  const after = Math.max(0, sub - disc);
  const gst = (after * (parseFloat(gstPercent) || 0)) / 100;
  return {
    subtotal: sub,
    discountAmount: disc,
    gstAmount: gst,
    totalAmount: after + gst,
  };
}

// ── shared inline styles ──────────────────────────────────────
const LABEL = {
  fontSize: "11px",
  color: "#94a3b8",
  fontWeight: 600,
  textTransform: "uppercase",
  display: "block",
  marginBottom: "4px",
};
const INPUT = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: "7px",
  border: "1px solid #d1d5db",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
};

// ── responsive CSS injected once ─────────────────────────────
const BILLING_CSS = `
/* wrapper */
.bt-wrap { padding:0 0 40px; box-sizing:border-box; width:100%; }

/* card */
.bt-card {
  background:#fff; border:1px solid #e5e7eb; border-radius:10px;
  padding:16px 18px; box-shadow:0 1px 4px rgba(0,0,0,.06);
}

/* section title */
.bt-title {
  font-weight:700; font-size:13px; color:#1e40af;
  margin-bottom:12px; text-transform:uppercase; letter-spacing:.5px;
}

/* summary 8-card grid */
.bt-summary {
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:8px;
  margin-bottom:20px;
}
.bt-summary-card {
  background:#fff; border:1px solid #e5e7eb; border-radius:8px;
  padding:10px 8px; text-align:center;
  box-shadow:0 1px 3px rgba(0,0,0,.05); min-width:0;
}
.bt-summary-val { font-size:14px; font-weight:800; word-break:break-all; line-height:1.2; }
.bt-summary-lbl { font-size:9px; color:#94a3b8; font-weight:600; margin-top:3px; text-transform:uppercase; }

/* filter bar */
.bt-filter { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; align-items:center; }
.bt-filter-search { flex:1 1 180px; min-width:0; }
.bt-filter-select { flex:1 1 120px; min-width:0; }
.bt-filter-btns   { display:flex; gap:8px; flex-shrink:0; }

/* buttons */
.bt-btn {
  padding:9px 16px; border-radius:8px; background:#1e40af; color:#fff;
  border:none; font-size:13px; font-weight:700; cursor:pointer; white-space:nowrap;
}
.bt-btn:disabled { opacity:0.7; }
.bt-btn-ghost {
  padding:8px 14px; border-radius:8px; background:#f1f5f9; color:#374151;
  border:1px solid #d1d5db; font-size:13px; font-weight:600;
  cursor:pointer; white-space:nowrap;
}

/* invoice row card */
.bt-row {
  background:#fff; border:1px solid #e5e7eb; border-radius:10px;
  box-shadow:0 1px 4px rgba(0,0,0,.06); margin-bottom:10px;
  padding:12px 14px; display:flex; flex-direction:column; gap:6px;
}
.bt-row-top     { display:flex; gap:10px; align-items:flex-start; }
.bt-row-invno   { flex:0 0 auto; min-width:88px; }
.bt-row-patient { flex:1 1 0; min-width:0; overflow:hidden; }
.bt-row-right   { flex:0 0 auto; text-align:right; }
.bt-row-services {
  font-size:12px; color:#475569;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.bt-row-mid     { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.bt-row-actions { display:flex; gap:6px; flex-wrap:wrap; padding-top:4px; border-top:1px solid #f1f5f9; }

/* action buttons inside row */
.bt-wa-btn {
  padding:6px 12px; border-radius:8px; background:#dcfce7;
  color:#16a34a; border:1px solid #16a34a;
  font-size:12px; font-weight:700; cursor:pointer; white-space:nowrap;
}
.bt-edit-btn {
  padding:6px 12px; border-radius:8px; background:#f1f5f9; color:#374151;
  border:1px solid #d1d5db; font-size:12px; font-weight:600;
  cursor:pointer; white-space:nowrap;
}
.bt-del-btn {
  padding:6px 10px; border-radius:8px; background:#fef2f2;
  color:#dc2626; border:1px solid #fca5a5;
  font-size:12px; font-weight:600; cursor:pointer; white-space:nowrap;
}

/* treatments table — desktop: grid, mobile: stacked card */
.bt-tbl-scroll { width:100%; }
.bt-tbl-head {
  display:grid;
  grid-template-columns:minmax(110px,3fr) 52px 88px 92px 32px;
  gap:6px; align-items:center; margin-bottom:6px;
}
.bt-tbl-row {
  display:grid;
  grid-template-columns:minmax(110px,3fr) 52px 88px 92px 32px;
  gap:6px; align-items:center; margin-bottom:8px;
}
.bt-tbl-hlbl { font-size:11px; color:#94a3b8; font-weight:600; text-transform:uppercase; }

/* stacked item card — hidden on desktop */
.bt-item-card { display:none; }

@media (max-width:640px) {
  /* hide desktop grid header + rows */
  .bt-tbl-head { display:none; }
  .bt-tbl-row  { display:none; }

  /* show stacked card instead */
  .bt-item-card {
    display:block;
    background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px;
    padding:10px 12px; margin-bottom:10px;
  }
  .bt-item-top {
    display:flex; gap:8px; align-items:flex-start; margin-bottom:8px;
  }
  .bt-item-treatment { flex:1 1 0; min-width:0; }
  .bt-item-del {
    flex-shrink:0; padding:5px 8px; border-radius:6px;
    background:#fef2f2; border:1px solid #fca5a5;
    color:#dc2626; font-size:13px; font-weight:700; cursor:pointer;
  }
  .bt-item-del:disabled { opacity:0.4; cursor:default; }
  .bt-item-nums {
    display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px;
  }
  .bt-item-lbl {
    font-size:10px; color:#94a3b8; font-weight:600;
    text-transform:uppercase; display:block; margin-bottom:3px;
  }
}

/* form grid helpers */
.bt-g2       { display:grid; grid-template-columns:1fr 1fr;         gap:10px; }
.bt-g3       { display:grid; grid-template-columns:repeat(3,1fr);   gap:10px; }
.bt-gp       { display:grid; grid-template-columns:repeat(3,1fr);   gap:10px; } /* payment */
.bt-form-outer { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:14px; }

/* form top bar */
.bt-topbar      { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; flex-wrap:wrap; gap:10px; }
.bt-topbar-btns { display:flex; gap:8px; }

/* patient history */
.bt-pat-hist { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:10px; }

/* ── mobile breakpoints ──────────────────────────────────── */
@media (max-width:600px) {
  .bt-summary  { grid-template-columns:repeat(2,1fr); }
  .bt-summary-val { font-size:13px; }
  .bt-g2  { grid-template-columns:1fr; }
  .bt-g3  { grid-template-columns:1fr 1fr; }
  .bt-gp  { grid-template-columns:1fr 1fr; }
  .bt-filter-search { flex:1 1 100%; }
}
@media (max-width:400px) {
  .bt-summary  { grid-template-columns:repeat(2,1fr); gap:6px; }
  .bt-summary-val { font-size:12px; }
  .bt-summary-lbl { font-size:8px; }
  .bt-g3  { grid-template-columns:1fr; }
  .bt-gp  { grid-template-columns:1fr; }
  .bt-card { padding:10px 10px; }
  .bt-row  { padding:10px 10px; }
}
`;

function BillingStyles() {
  return <style>{BILLING_CSS}</style>;
}

// ── jsPDF loader — exact same pattern as PatientsTab ─────────
function loadJsPDF(onReady) {
  if (window.jspdf) {
    onReady();
    return;
  }
  const existing = document.getElementById("jspdf-cdn");
  if (existing) {
    existing.addEventListener("load", onReady);
    return;
  }
  const script = document.createElement("script");
  script.id = "jspdf-cdn";
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
  script.crossOrigin = "anonymous";
  script.onload = onReady;
  script.onerror = () => {};
  document.head.appendChild(script);
}

// ── InvoiceShareModal — identical pattern to PrescriptionModal ─
function InvoiceShareModal({ inv, onClose, showNotify }) {
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [fileName, setFileName] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);

  // ── buildPDF defined FIRST (before useEffect) so it is in scope ──
  const buildPDF = useCallback(() => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });
    const W = 210,
      H = 297;

    // colour helpers — identical to PrescriptionModal
    const sf = (c) => pdf.setFillColor(c[0], c[1], c[2]);
    const sd = (c) => pdf.setDrawColor(c[0], c[1], c[2]);
    const st = (c) => pdf.setTextColor(c[0], c[1], c[2]);

    // exact same palette as PrescriptionModal
    const NAVY = [8, 25, 65];
    const BLUE = [20, 80, 160];
    const LBLUE = [210, 228, 248];
    const LBLUE2 = [232, 242, 252];
    const MIDBLUE = [160, 195, 235];
    const TEAL = [0, 130, 130];
    const TEAL2 = [210, 240, 240];
    const WHITE = [255, 255, 255];
    const LGRAY = [245, 247, 251];
    const LGRAY2 = [250, 251, 254];
    const LGRAY3 = [240, 243, 248];
    const GRAY = [115, 118, 130];
    const GRAY2 = [75, 80, 95];
    const GOLD = [170, 130, 40];
    const GOLD2 = [250, 245, 225];
    const GREEN = [22, 163, 74];
    const RED = [185, 28, 28];
    const INK = [28, 52, 140];
    const INK2 = [45, 75, 170];

    const today = new Date();
    const todayFmt =
      today.getDate() +
      " " +
      MONTHS[today.getMonth()] +
      " " +
      today.getFullYear();

    // doc object — same structure as PrescriptionModal
    const doc = { name: inv.doctorName || "Doctor", qual: "", reg: "" };

    // ── outer border — identical ──────────────────────────────
    sd(MIDBLUE);
    pdf.setLineWidth(0.8);
    pdf.rect(3.5, 3.5, W - 7, H - 7, "S");
    sd(LBLUE);
    pdf.setLineWidth(0.3);
    pdf.rect(5.5, 5.5, W - 11, H - 11, "S");

    // ── header — identical layout to PrescriptionModal ────────
    sf(NAVY);
    pdf.rect(3.5, 3.5, W - 7, 46, "F");
    sf(BLUE);
    pdf.rect(3.5, 43, W - 7, 10, "F");
    sf(LBLUE);
    pdf.rect(3.5, 53, W - 7, 6, "F");

    // left side: doctor name
    st(WHITE);
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text(doc.name, 14, 19);
    st(LBLUE);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text((doc.qual || "").toUpperCase(), 14, 26);
    sd(MIDBLUE);
    pdf.setLineWidth(0.25);
    pdf.line(14, 28.5, W - 40, 28.5);
    st(LGRAY);
    pdf.setFontSize(7);
    pdf.text("Reg. No.:  " + (doc.reg || "\u2014"), 14, 33.5);
    pdf.text("Specialisation:  Dental & Oral Health Care", 14, 38.5);

    // right side: hospital name
    st(WHITE);
    pdf.setFontSize(15);
    pdf.setFont("helvetica", "bold");
    pdf.text("PEARLSMILE", W - 10, 19, { align: "right" });
    st(LBLUE);
    pdf.setFontSize(7.5);
    pdf.setFont("helvetica", "normal");
    pdf.text("DENTAL HOSPITAL", W - 10, 25.5, { align: "right" });
    sd(MIDBLUE);
    pdf.setLineWidth(0.25);
    pdf.line(W - 72, 28.5, W - 10, 28.5);
    st(LGRAY);
    pdf.setFontSize(6.8);
    pdf.text("12, Dental Plaza, MG Road, Pune - 411001", W - 10, 33.5, {
      align: "right",
    });
    pdf.text("+91 87936 08083  |  care@pearlsmiledental.in", W - 10, 38.5, {
      align: "right",
    });

    // centre bar — TAX INVOICE
    st(WHITE);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text("TAX INVOICE", W / 2, 50, { align: "center" });
    st(LBLUE2);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.text("Invoice No.: " + (inv.invoiceNumber || "\u2014"), 10, 50);
    pdf.text("Date: " + friendlyDate(inv.invoiceDate), W - 10, 50, {
      align: "right",
    });

    st(BLUE);
    pdf.setFontSize(7.5);
    pdf.setFont("helvetica", "bold");
    pdf.text("PATIENT INFORMATION", W / 2, 57, { align: "center" });

    // ── patient info table — identical drawCell to PrescriptionModal
    const infoTop = 61;
    sf(LGRAY3);
    pdf.rect(10, infoTop, W - 20, 33, "F");
    sd(LBLUE);
    pdf.setLineWidth(0.25);
    pdf.rect(10, infoTop, W - 20, 33, "S");
    sd(MIDBLUE);
    pdf.setLineWidth(0.2);
    pdf.line(W / 2, infoTop, W / 2, infoTop + 33);
    let rdy = infoTop + 11;
    for (let ri = 0; ri < 2; ri++) {
      pdf.line(10, rdy, W - 10, rdy);
      rdy += 11;
    }

    const drawCell = (label, value, x, y, maxW) => {
      st(GRAY2);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6.8);
      pdf.text(label, x + 3, y + 4);
      st(NAVY);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      const val = pdf.splitTextToSize(String(value || "\u2014"), maxW || 75);
      pdf.text(val[0], x + 3, y + 9.5);
    };
    const cHalf = W / 2;
    drawCell(
      "PATIENT NAME",
      inv.patientName || "\u2014",
      10,
      infoTop,
      cHalf - 16,
    );
    drawCell(
      "MOBILE",
      inv.patientPhone || "\u2014",
      cHalf,
      infoTop,
      cHalf - 16,
    );
    drawCell(
      "AGE / GENDER",
      (inv.patientAge || "\u2014") +
        (inv.patientGender ? " | " + inv.patientGender : ""),
      10,
      infoTop + 11,
      cHalf - 16,
    );
    drawCell(
      "INVOICE DATE",
      friendlyDate(inv.invoiceDate),
      cHalf,
      infoTop + 11,
      cHalf - 16,
    );
    drawCell("DOCTOR", doc.name, 10, infoTop + 22, cHalf - 16);
    drawCell(
      "PAYMENT STATUS",
      (inv.paymentStatus || "unpaid").toUpperCase() +
        " | " +
        (inv.paymentMethod || "\u2014").toUpperCase(),
      cHalf,
      infoTop + 22,
      cHalf - 16,
    );

    // ── treatments table ──────────────────────────────────────
    const tblTop = infoTop + 39;
    sf(BLUE);
    pdf.rect(10, tblTop, W - 20, 8, "F");
    st(WHITE);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.text("TREATMENT / SERVICE", 14, tblTop + 5.5);
    pdf.text("QTY", 122, tblTop + 5.5, { align: "center" });
    pdf.text("RATE (Rs.)", 148, tblTop + 5.5, { align: "right" });
    pdf.text("AMOUNT (Rs.)", W - 12, tblTop + 5.5, { align: "right" });

    let rowY = tblTop + 8;
    (inv.items || []).forEach((item, idx) => {
      const bg = idx % 2 === 0 ? LGRAY2 : WHITE;
      sf(bg);
      pdf.rect(10, rowY, W - 20, 9, "F");
      sd(LBLUE);
      pdf.setLineWidth(0.15);
      pdf.rect(10, rowY, W - 20, 9, "S");
      st(NAVY);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      const tname = pdf.splitTextToSize(item.treatment || "", 92);
      pdf.text(tname[0], 14, rowY + 6);
      pdf.text(String(item.quantity || 1), 122, rowY + 6, { align: "center" });
      pdf.text(
        Number(item.rate || 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
        148,
        rowY + 6,
        { align: "right" },
      );
      pdf.text(
        Number(item.amount || 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
        W - 12,
        rowY + 6,
        { align: "right" },
      );
      rowY += 9;
    });
    rowY += 3;

    // ── totals block ──────────────────────────────────────────
    const totX = W / 2;

    // subtotal
    sf(LGRAY3);
    pdf.rect(totX, rowY, W - 10 - totX, 8, "F");
    sd(LBLUE);
    pdf.setLineWidth(0.15);
    pdf.rect(totX, rowY, W - 10 - totX, 8, "S");
    st(GRAY2);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text("Subtotal", totX + 4, rowY + 5.5);
    pdf.text(
      "Rs. " +
        Number(inv.subtotal || 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
      W - 12,
      rowY + 5.5,
      { align: "right" },
    );
    rowY += 8;

    // discount (only if > 0)
    if ((inv.discountAmount || 0) > 0) {
      sf(LGRAY3);
      pdf.rect(totX, rowY, W - 10 - totX, 8, "F");
      sd(LBLUE);
      pdf.setLineWidth(0.15);
      pdf.rect(totX, rowY, W - 10 - totX, 8, "S");
      st(RED);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text(
        "Discount (" +
          (inv.discountType === "percent"
            ? (inv.discountValue || 0) + "%"
            : "Flat") +
          ")",
        totX + 4,
        rowY + 5.5,
      );
      pdf.text(
        "- Rs. " +
          Number(inv.discountAmount).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          }),
        W - 12,
        rowY + 5.5,
        { align: "right" },
      );
      rowY += 8;
    }

    // GST (only if > 0)
    if ((inv.gstAmount || 0) > 0) {
      sf(LGRAY3);
      pdf.rect(totX, rowY, W - 10 - totX, 8, "F");
      sd(LBLUE);
      pdf.setLineWidth(0.15);
      pdf.rect(totX, rowY, W - 10 - totX, 8, "S");
      st(TEAL);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text("GST (" + (inv.gstPercent || 0) + "%)", totX + 4, rowY + 5.5);
      pdf.text(
        "+ Rs. " +
          Number(inv.gstAmount).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          }),
        W - 12,
        rowY + 5.5,
        { align: "right" },
      );
      rowY += 8;
    }

    // grand total — navy background like prescription header bar
    sf(NAVY);
    pdf.rect(totX, rowY, W - 10 - totX, 10, "F");
    st(WHITE);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("TOTAL AMOUNT", totX + 4, rowY + 7);
    pdf.text(
      "Rs. " +
        Number(inv.totalAmount || 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
      W - 12,
      rowY + 7,
      { align: "right" },
    );
    rowY += 10;

    // amount paid
    sf(LGRAY3);
    pdf.rect(totX, rowY, W - 10 - totX, 8, "F");
    sd(LBLUE);
    pdf.setLineWidth(0.15);
    pdf.rect(totX, rowY, W - 10 - totX, 8, "S");
    st(GREEN);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.text("Amount Paid", totX + 4, rowY + 5.5);
    pdf.text(
      "Rs. " +
        Number(inv.amountPaid || 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        }),
      W - 12,
      rowY + 5.5,
      { align: "right" },
    );
    rowY += 8;

    // amount due (only if > 0)
    if ((inv.amountDue || 0) > 0) {
      sf(GOLD2);
      pdf.rect(totX, rowY, W - 10 - totX, 8, "F");
      sd(LBLUE);
      pdf.setLineWidth(0.15);
      pdf.rect(totX, rowY, W - 10 - totX, 8, "S");
      st(RED);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.text("Amount Due", totX + 4, rowY + 5.5);
      pdf.text(
        "Rs. " +
          Number(inv.amountDue).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          }),
        W - 12,
        rowY + 5.5,
        { align: "right" },
      );
      rowY += 8;
    }
    rowY += 6;

    // ── payment info box — same teal style as "next appointment" in PrescriptionModal
    sf(TEAL2);
    pdf.roundedRect(10, rowY, W - 20, 13, 2, 2, "F");
    sd(TEAL);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(10, rowY, W - 20, 13, 2, 2, "S");
    sf(TEAL);
    pdf.roundedRect(10, rowY, 10, 13, 2, 2, "F");
    st(WHITE);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6.5);
    pdf.text("PAY", 11.2, rowY + 5.5);
    pdf.text("INFO", 11.0, rowY + 10);
    st(TEAL);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("Payment Method:", 24, rowY + 6.5);
    st(NAVY);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text((inv.paymentMethod || "\u2014").toUpperCase(), 68, rowY + 6.5);
    st(GRAY);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    const payRight = [];
    if (inv.receiptNumber) payRight.push("Receipt: " + inv.receiptNumber);
    if (inv.paymentDate)
      payRight.push("Date: " + friendlyDate(inv.paymentDate));
    pdf.text(payRight.join("   "), W - 12, rowY + 11, { align: "right" });
    rowY += 19;

    // ── insurance block — same gold style as "general advice" in PrescriptionModal
    if (inv.insuranceProvider) {
      sf(GOLD2);
      pdf.roundedRect(10, rowY, W - 20, 13, 2, 2, "F");
      sd(GOLD);
      pdf.setLineWidth(0.35);
      pdf.roundedRect(10, rowY, W - 20, 13, 2, 2, "S");
      sf(GOLD);
      pdf.roundedRect(10, rowY, 10, 13, 2, 2, "F");
      st(WHITE);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6.2);
      pdf.text("INS.", 11.2, rowY + 5.5);
      pdf.text("CLM.", 11.0, rowY + 10);
      st(GOLD);
      pdf.setFontSize(7.5);
      pdf.setFont("helvetica", "bold");
      pdf.text("Insurance: " + inv.insuranceProvider, 24, rowY + 6.5);
      st(GRAY2);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.text(
        "Claim No.: " +
          (inv.insuranceClaimNo || "\u2014") +
          "   Status: " +
          (inv.insuranceStatus || "\u2014").toUpperCase(),
        24,
        rowY + 11,
      );
      rowY += 19;
    }

    // ── notes box ─────────────────────────────────────────────
    if (inv.notes) {
      rowY += 4;
      sf(LGRAY2);
      pdf.roundedRect(10, rowY, W - 20, 14, 2, 2, "F");
      sd(LBLUE);
      pdf.setLineWidth(0.25);
      pdf.roundedRect(10, rowY, W - 20, 14, 2, 2, "S");
      st(GRAY2);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      pdf.text("Notes:", 14, rowY + 6);
      st(NAVY);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      const nl = pdf.splitTextToSize(inv.notes, W - 38);
      pdf.text(nl[0] || "", 34, rowY + 6);
      if (nl[1]) pdf.text(nl[1], 14, rowY + 11.5);
      rowY += 18;
    }

    // ── watermark — identical to PrescriptionModal ────────────
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.035 }));
    st(NAVY);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(44);
    pdf.text("PEARLSMILE", W / 2, H / 2 - 5, { align: "center", angle: 35 });
    pdf.restoreGraphicsState();

    // ── doctor seal — copy-pasted exactly from PrescriptionModal ─
    const sigY = Math.max(rowY + 10, H - 55);
    const cx = W - 46,
      cy = sigY + 13,
      R = 18;

    sd(INK);
    pdf.setLineWidth(1.2);
    pdf.circle(cx, cy, R, "S");
    pdf.setLineWidth(0.4);
    pdf.circle(cx, cy, R - 2.5, "S");

    const drawStar = (sx, sy, sr) => {
      const pts = [];
      for (let si = 0; si < 5; si++) {
        const ao = (si * 4 * Math.PI) / 5 - Math.PI / 2;
        const ai = ao + (2 * Math.PI) / 5;
        pts.push({ x: sx + sr * Math.cos(ao), y: sy + sr * Math.sin(ao) });
        pts.push({
          x: sx + sr * 0.4 * Math.cos(ai),
          y: sy + sr * 0.4 * Math.sin(ai),
        });
      }
      pdf.setLineWidth(0.3);
      sd(INK);
      sf(INK);
      pdf.lines(
        pts.slice(1).map((pt, i) => [pt.x - pts[i].x, pt.y - pts[i].y]),
        pts[0].x,
        pts[0].y,
        [1, 1],
        "FD",
        true,
      );
    };
    drawStar(cx - R + 3.5, cy + 1, 2.2);
    drawStar(cx + R - 3.5, cy + 1, 2.2);

    // doctor name curved at top of circle — identical
    const docShort = (doc.name || "Doctor").toUpperCase();
    sd(INK);
    st(INK);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(5.8);
    const topSpan = Math.min(docShort.length * 0.19, 1.3);
    const topStart = -Math.PI / 2 - topSpan / 2;
    for (let ti = 0; ti < docShort.length; ti++) {
      const ta = topStart + (ti / Math.max(docShort.length - 1, 1)) * topSpan;
      const tx = cx + (R - 1.5) * Math.cos(ta);
      const ty = cy + (R - 1.5) * Math.sin(ta);
      const trot = ((ta + Math.PI / 2) * 180) / Math.PI;
      pdf.text(docShort[ti], tx, ty, { align: "center", angle: -trot });
    }

    // "PEARLSMILE DENTAL" curved at bottom of circle — identical
    pdf.setFontSize(5.5);
    const botStr = "PEARLSMILE DENTAL";
    const botSpan = Math.min(botStr.length * 0.175, 1.4);
    const botStart = Math.PI / 2 - botSpan / 2;
    for (let bi = 0; bi < botStr.length; bi++) {
      const ba = botStart + (bi / Math.max(botStr.length - 1, 1)) * botSpan;
      const bx = cx + (R - 1.5) * Math.cos(ba);
      const by = cy + (R - 1.5) * Math.sin(ba);
      const brot = ((ba - Math.PI / 2) * 180) / Math.PI;
      pdf.text(botStr[bi], bx, by, { align: "center", angle: -brot });
    }

    // caduceus rod + wings + snake — identical line by line
    sd(INK);
    pdf.setLineWidth(0.8);
    pdf.line(cx, cy - 8, cx, cy + 7);
    pdf.setLineWidth(0.5);
    pdf.line(cx, cy - 7.5, cx - 4, cy - 9.5);
    pdf.line(cx - 4, cy - 9.5, cx - 6, cy - 8);
    pdf.line(cx - 6, cy - 8, cx - 3, cy - 6.5);
    pdf.line(cx, cy - 7.5, cx + 4, cy - 9.5);
    pdf.line(cx + 4, cy - 9.5, cx + 6, cy - 8);
    pdf.line(cx + 6, cy - 8, cx + 3, cy - 6.5);
    sf(INK);
    pdf.circle(cx, cy - 8.2, 1, "F");
    pdf.setLineWidth(0.6);
    pdf.lines(
      [
        [2, -2],
        [2, -2],
        [0, -2],
      ],
      cx - 3,
      cy + 5,
      [1, 1],
      "S",
    );
    pdf.lines(
      [
        [-2, -2],
        [-2, -2],
        [0, -2],
      ],
      cx + 3,
      cy + 1,
      [1, 1],
      "S",
    );
    pdf.lines(
      [
        [2, -2],
        [2, -2],
      ],
      cx - 3,
      cy - 3,
      [1, 1],
      "S",
    );
    pdf.lines(
      [
        [-2, -2],
        [-2, -2],
        [0, -2],
      ],
      cx + 3,
      cy + 5,
      [1, 1],
      "S",
    );
    pdf.lines(
      [
        [2, -2],
        [2, -2],
        [0, -2],
      ],
      cx - 3,
      cy + 1,
      [1, 1],
      "S",
    );

    // "Reg." and "Authorised Signatory" — identical
    st(INK);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(4.5);
    pdf.text("Reg. " + (doc.reg || "\u2014"), cx, cy + R - 5.5, {
      align: "center",
    });
    st(INK2);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.5);
    pdf.text("Authorised Signatory", cx, cy + R + 4, { align: "center" });

    // invoice ref + date below stamp — same as "Rx No." placement in PrescriptionModal
    st(GRAY);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.text("Invoice: " + (inv.invoiceNumber || "\u2014"), 14, sigY + 30);
    pdf.text("Date: " + todayFmt, W - 14, sigY + 30, { align: "right" });

    // ── footer — identical to PrescriptionModal ───────────────
    sf(NAVY);
    pdf.rect(3.5, H - 21, W - 7, 17.5, "F");
    sf(BLUE);
    pdf.rect(3.5, H - 7, W - 7, 3.5, "F");
    st(WHITE);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.text("PearlSmile Dental Hospital", 10, H - 14.5);
    st(LBLUE);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.text("+91 87936 08083", 10, H - 9.5);
    pdf.text("care@pearlsmiledental.in", W / 2, H - 9.5, { align: "center" });
    pdf.text("12, Dental Plaza, MG Road, Pune - 411001", W - 10, H - 9.5, {
      align: "right",
    });
    st(LBLUE2);
    pdf.setFontSize(6);
    pdf.setFont("helvetica", "italic");
    pdf.text(
      "This is a computer-generated invoice from PearlSmile Dental Hospital. Valid only with authorised doctor details.",
      W / 2,
      H - 5.5,
      { align: "center" },
    );

    // ── output — identical to PrescriptionModal ───────────────
    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);
    const name =
      "Invoice_" +
      (inv.invoiceNumber || "INV") +
      "_" +
      (inv.patientName || "Patient").replace(/\s+/g, "_") +
      ".pdf";

    setPdfBlob(blob);
    setPdfUrl(url);
    setFileName(name);

    // native share check — identical to PrescriptionModal
    const testFile = new File([blob], name, { type: "application/pdf" });
    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [testFile] })
    ) {
      setCanNativeShare(true);
    }
    setLoading(false);
  }, [inv, setPdfBlob, setPdfUrl, setFileName, setCanNativeShare, setLoading]);

  // ── escape handler ────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // ── generate PDF on mount ─────────────────────────────────
  useEffect(() => {
    loadJsPDF(buildPDF);
  }, [buildPDF]);

  // ── button handlers — identical to PrescriptionModal ─────
  const openFullPreview = () => {
    if (pdfUrl) window.open(pdfUrl, "_blank");
  };

  const nativeShare = async () => {
    if (!pdfBlob) return;
    const file = new File([pdfBlob], fileName, { type: "application/pdf" });
    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      navigator
        .share({
          title: "Invoice \u2014 PearlSmile Dental Hospital",
          text: "",
          files: [file],
        })
        .then(() => {
          showNotify("Shared!", "Invoice shared successfully.");
          onClose();
        })
        .catch((err) => {
          if (err.name !== "AbortError")
            showNotify("Share Failed", err.message, true);
        });
    } else {
      showNotify(
        "Not Supported",
        "Native share not supported on this device/browser.",
        true,
      );
    }
  };

  // ── modal JSX — pixel-perfect copy of PrescriptionModal ──
  return (
    <div
      className="rx-share-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 540,
          boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "92vh",
        }}
      >
        {/* header — identical gradient + layout */}
        <div
          style={{
            background: "linear-gradient(135deg,#0a1628,#1a3a6b)",
            padding: "18px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>📄</span>
            <div>
              <div
                style={{
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 15,
                  fontFamily: "DM Sans,sans-serif",
                }}
              >
                Invoice Ready
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 12,
                  fontFamily: "DM Sans,sans-serif",
                }}
              >
                {inv.patientName} &middot; {inv.invoiceNumber}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "none",
              color: "#fff",
              width: 32,
              height: 32,
              borderRadius: "50%",
              fontSize: 17,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            &#10005;
          </button>
        </div>

        {/* PDF preview — identical */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            background: "#f0eeeb",
            minHeight: 340,
            position: "relative",
          }}
        >
          {loading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#f0eeeb",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  border: "3px solid #0d7377",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <div
                style={{
                  fontSize: 13,
                  color: "#5a5550",
                  fontFamily: "DM Sans,sans-serif",
                }}
              >
                Generating PDF&hellip;
              </div>
            </div>
          )}
          {pdfUrl && (
            <iframe
              title="invoice-preview"
              src={pdfUrl}
              style={{ width: "100%", height: 420, border: "none" }}
            />
          )}
        </div>

        {/* action buttons — identical to PrescriptionModal */}
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            background: "#fff",
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={openFullPreview}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#e5e0d8";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#f0eeeb";
              }}
              style={{
                flex: 1,
                background: "#f0eeeb",
                color: "#0a1628",
                border: "1.5px solid #ddd9d3",
                borderRadius: 10,
                padding: 10,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "DM Sans,sans-serif",
                transition: "background 0.2s",
              }}
            >
              &#128269; Open Full PDF
            </button>
            {canNativeShare && (
              <button
                onClick={nativeShare}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#e5e0d8";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#f0eeeb";
                }}
                style={{
                  flex: 1,
                  background: "#f0eeeb",
                  color: "#0a1628",
                  border: "1.5px solid #ddd9d3",
                  borderRadius: 10,
                  padding: 10,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "DM Sans,sans-serif",
                  transition: "background 0.2s",
                }}
              >
                &#128228; Share (Device)
              </button>
            )}
          </div>
          <p
            style={{
              fontSize: 11,
              color: "#9a9590",
              textAlign: "center",
              margin: 0,
              fontFamily: "DM Sans,sans-serif",
              lineHeight: 1.5,
            }}
          >
            On mobile: tap &ldquo;Share (Device)&rdquo; to send directly via
            WhatsApp.
            <br />
            On desktop: use &ldquo;Open Full PDF&rdquo; to view, then share
            manually.
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Patient Picker Modal ──────────────────────────────────────
function PatientPickerModal({ patients, onSelect, onClose }) {
  const [q, setQ] = useState("");
  const list = patients.filter(
    (p) =>
      (p.name || "").toLowerCase().includes(q.toLowerCase()) ||
      (p.mobile || "").includes(q),
  );
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 9000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: "15px", color: "#1e293b" }}>
            Select Patient
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "#94a3b8",
              lineHeight: 1,
            }}
          >
            &#10005;
          </button>
        </div>
        <div
          style={{ padding: "12px 20px", borderBottom: "1px solid #f1f5f9" }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or phone..."
            style={INPUT}
            autoFocus
          />
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {list.length === 0 ? (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              No patients found
            </div>
          ) : (
            list.map((p) => (
              <div
                key={p._id}
                onClick={() => onSelect(p)}
                style={{
                  padding: "12px 20px",
                  borderBottom: "1px solid #f8fafc",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f0f9ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "14px",
                      color: "#1e293b",
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginTop: "2px",
                    }}
                  >
                    {p.mobile}
                    {p.age ? " | Age: " + p.age : ""}
                    {p.gender ? " | " + p.gender : ""}
                  </div>
                </div>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                  {(p.visits || []).length} visits
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Invoice Form ──────────────────────────────────────────────
const BLANK_FORM = (doctor) => ({
  patientId: "",
  patientName: "",
  patientPhone: "",
  patientAge: "",
  patientGender: "",
  doctorName: (doctor && doctor.name) || "",
  doctorId: (doctor && doctor.doctorId) || "",
  invoiceDate: todayISO(),
  discountType: "flat",
  discountValue: "0",
  gstPercent: "0",
  paymentStatus: "unpaid",
  paymentMethod: "cash",
  amountPaid: "0",
  paymentDate: todayISO(),
  receiptNumber: "",
  upiId: "",
  insuranceProvider: "",
  insuranceClaimNo: "",
  insuranceStatus: "",
  notes: "",
});

function InvoiceForm({
  patients,
  doctor,
  invoice,
  onSave,
  onCancel,
  showNotify,
}) {
  const isEdit = !!invoice;
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => BLANK_FORM(doctor));
  const [items, setItems] = useState([
    { treatment: "", quantity: "1", rate: "", amount: "0" },
  ]);

  // populate form when editing
  useEffect(() => {
    if (invoice) {
      setForm({
        patientId: invoice.patientId || "",
        patientName: invoice.patientName || "",
        patientPhone: invoice.patientPhone || "",
        patientAge: invoice.patientAge || "",
        patientGender: invoice.patientGender || "",
        doctorName: invoice.doctorName || (doctor && doctor.name) || "",
        doctorId: invoice.doctorId || (doctor && doctor.doctorId) || "",
        invoiceDate: invoice.invoiceDate || todayISO(),
        discountType: invoice.discountType || "flat",
        discountValue: String(invoice.discountValue || 0),
        gstPercent: String(invoice.gstPercent || 0),
        paymentStatus: invoice.paymentStatus || "unpaid",
        paymentMethod: invoice.paymentMethod || "cash",
        amountPaid: String(invoice.amountPaid || 0),
        paymentDate: invoice.paymentDate || todayISO(),
        receiptNumber: invoice.receiptNumber || "",
        upiId: invoice.upiId || "",
        insuranceProvider: invoice.insuranceProvider || "",
        insuranceClaimNo: invoice.insuranceClaimNo || "",
        insuranceStatus: invoice.insuranceStatus || "",
        notes: invoice.notes || "",
      });
      setItems(
        (invoice.items || []).map((item) => ({
          treatment: String(item.treatment || ""),
          quantity: String(item.quantity || 1),
          rate: String(item.rate || ""),
          amount: String(item.amount || 0),
        })),
      );
    }
  }, [invoice, doctor]);

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const pickPatient = (p) => {
    setForm((f) => ({
      ...f,
      patientId: p._id,
      patientName: p.name,
      patientPhone: p.mobile || "",
      patientAge: p.age || "",
      patientGender: p.gender || "",
    }));
    setShowPicker(false);
  };

  const updateItem = (idx, key, val) => {
    setItems((prev) => {
      const arr = prev.map((x) => ({ ...x }));
      arr[idx][key] = val;
      if (key === "quantity" || key === "rate") {
        const qty =
          parseFloat(key === "quantity" ? val : arr[idx].quantity) || 0;
        const rt = parseFloat(key === "rate" ? val : arr[idx].rate) || 0;
        arr[idx].amount = String((qty * rt).toFixed(2));
      }
      return arr;
    });
  };

  const addItem = () =>
    setItems((p) => [
      ...p,
      { treatment: "", quantity: "1", rate: "", amount: "0" },
    ]);
  const removeItem = (idx) => setItems((p) => p.filter((_, i) => i !== idx));

  const { subtotal, discountAmount, gstAmount, totalAmount } = calcTotals(
    items,
    form.discountType,
    form.discountValue,
    form.gstPercent,
  );
  const amountDue = Math.max(
    0,
    totalAmount - (parseFloat(form.amountPaid) || 0),
  );

  const handleSave = async () => {
    if (!form.patientId) {
      showNotify("Error", "Please select a patient.", true);
      return;
    }
    if (items.some((i) => !i.treatment || !i.rate)) {
      showNotify("Error", "Fill treatment and rate for all items.", true);
      return;
    }
    setSaving(true);
    try {
      const paid = parseFloat(form.amountPaid) || 0;
      const payload = {
        ...form,
        discountValue: parseFloat(form.discountValue) || 0,
        gstPercent: parseFloat(form.gstPercent) || 0,
        amountPaid: paid,
        items: items.map((i) => ({
          treatment: i.treatment,
          quantity: parseFloat(i.quantity) || 1,
          rate: parseFloat(i.rate) || 0,
          amount: parseFloat(i.amount) || 0,
        })),
        subtotal,
        discountAmount,
        gstAmount,
        totalAmount,
        amountDue,
        paymentStatus:
          paid >= totalAmount && totalAmount > 0
            ? "paid"
            : paid > 0
              ? "partial"
              : "unpaid",
      };
      if (isEdit) {
        await api.put("/billing/" + invoice._id, payload);
        showNotify("Saved", "Invoice updated.");
      } else {
        await api.post("/billing", payload);
        showNotify("Created", "Invoice created.");
      }
      onSave();
    } catch (err) {
      showNotify("Error", err.message, true);
    }
    setSaving(false);
  };

  const saveBtn = (
    <button
      onClick={handleSave}
      disabled={saving}
      className="bt-btn"
      style={{ opacity: saving ? 0.7 : 1 }}
    >
      {saving ? "Saving..." : isEdit ? "Update Invoice" : "Create Invoice"}
    </button>
  );

  return (
    <div>
      <BillingStyles />
      {showPicker && (
        <PatientPickerModal
          patients={patients}
          onSelect={pickPatient}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* top bar */}
      <div className="bt-topbar">
        <h3 style={{ margin: 0, color: "#1e293b", fontSize: "17px" }}>
          {isEdit ? "Edit Invoice" : "New Invoice"}
        </h3>
        <div className="bt-topbar-btns">
          <button onClick={onCancel} className="bt-btn-ghost">
            Cancel
          </button>
          {saveBtn}
        </div>
      </div>

      {/* patient + invoice date row */}
      <div className="bt-form-outer">
        <div className="bt-card">
          <div className="bt-title">Patient Details</div>
          <button
            onClick={() => setShowPicker(true)}
            className="bt-btn-ghost"
            style={{ width: "100%", marginBottom: "12px", textAlign: "left" }}
          >
            {form.patientName
              ? form.patientName + " \u2014 " + form.patientPhone
              : "Select Patient from Profile..."}
          </button>
          {form.patientName && (
            <div
              style={{
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: "7px",
                padding: "10px 12px",
                fontSize: "12px",
                color: "#0369a1",
              }}
            >
              <strong>{form.patientName}</strong>&nbsp;|&nbsp;
              {form.patientPhone}
              {form.patientAge ? " | Age: " + form.patientAge : ""}
              {form.patientGender ? " | " + form.patientGender : ""}
            </div>
          )}
        </div>

        <div className="bt-card">
          <div className="bt-title">Invoice Details</div>
          <div className="bt-g2">
            <div>
              <label style={LABEL}>Invoice Date</label>
              <input
                type="date"
                value={form.invoiceDate}
                onChange={(e) => setF("invoiceDate", e.target.value)}
                style={INPUT}
              />
            </div>
            <div>
              <label style={LABEL}>Doctor Name</label>
              <input
                value={form.doctorName}
                onChange={(e) => setF("doctorName", e.target.value)}
                style={INPUT}
              />
            </div>
          </div>
        </div>
      </div>

      {/* treatments table */}
      <div className="bt-card" style={{ marginTop: "14px" }}>
        <div className="bt-title">Treatments / Services</div>
        <div className="bt-tbl-scroll">
          {/* desktop: column header */}
          <div className="bt-tbl-head">
            {TBL_HEADERS.map((h) => (
              <div key={h} className="bt-tbl-hlbl">
                {h}
              </div>
            ))}
          </div>

          {items.map((item, idx) => (
            <React.Fragment key={"item-" + idx}>
              {/* ── DESKTOP grid row (hidden on mobile via CSS) ── */}
              <div className="bt-tbl-row">
                <div>
                  <input
                    list={"tx-" + idx}
                    value={item.treatment}
                    onChange={(e) =>
                      updateItem(idx, "treatment", e.target.value)
                    }
                    placeholder="Type or select..."
                    style={INPUT}
                  />
                  <datalist id={"tx-" + idx}>
                    {DENTAL_TREATMENTS.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </div>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                  style={INPUT}
                />
                <input
                  type="number"
                  min="0"
                  value={item.rate}
                  onChange={(e) => updateItem(idx, "rate", e.target.value)}
                  placeholder="0"
                  style={INPUT}
                />
                <input
                  readOnly
                  value={fmtMoney(item.amount)}
                  style={{ ...INPUT, background: "#f8fafc", fontWeight: 600 }}
                />
                <button
                  onClick={() => removeItem(idx)}
                  disabled={items.length === 1}
                  style={{
                    padding: "6px",
                    borderRadius: "6px",
                    background: "#fef2f2",
                    border: "1px solid #fca5a5",
                    color: "#dc2626",
                    cursor: items.length === 1 ? "default" : "pointer",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  &#10005;
                </button>
              </div>

              {/* ── MOBILE stacked card (hidden on desktop via CSS) ── */}
              <div className="bt-item-card">
                {/* treatment input + delete button */}
                <div className="bt-item-top">
                  <div className="bt-item-treatment">
                    <span className="bt-item-lbl">Treatment</span>
                    <input
                      list={"txm-" + idx}
                      value={item.treatment}
                      onChange={(e) =>
                        updateItem(idx, "treatment", e.target.value)
                      }
                      placeholder="Type or select treatment..."
                      style={INPUT}
                    />
                    <datalist id={"txm-" + idx}>
                      {DENTAL_TREATMENTS.map((t) => (
                        <option key={t} value={t} />
                      ))}
                    </datalist>
                  </div>
                  <button
                    className="bt-item-del"
                    onClick={() => removeItem(idx)}
                    disabled={items.length === 1}
                  >
                    &#10005;
                  </button>
                </div>
                {/* qty / rate / amount in 3-col row */}
                <div className="bt-item-nums">
                  <div>
                    <span className="bt-item-lbl">Qty</span>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(idx, "quantity", e.target.value)
                      }
                      style={INPUT}
                    />
                  </div>
                  <div>
                    <span className="bt-item-lbl">Rate (Rs.)</span>
                    <input
                      type="number"
                      min="0"
                      value={item.rate}
                      onChange={(e) => updateItem(idx, "rate", e.target.value)}
                      placeholder="0"
                      style={INPUT}
                    />
                  </div>
                  <div>
                    <span className="bt-item-lbl">Amount</span>
                    <input
                      readOnly
                      value={fmtMoney(item.amount)}
                      style={{
                        ...INPUT,
                        background: "#f0fdf4",
                        fontWeight: 700,
                        color: "#16a34a",
                      }}
                    />
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
        <button
          onClick={addItem}
          className="bt-btn-ghost"
          style={{ marginTop: "8px", fontSize: "12px" }}
        >
          + Add Treatment
        </button>
      </div>

      {/* discount + summary */}
      <div className="bt-form-outer" style={{ marginTop: "14px" }}>
        <div className="bt-card">
          <div className="bt-title">Discount and Tax</div>
          <div className="bt-g2">
            <div>
              <label style={LABEL}>Discount Type</label>
              <select
                value={form.discountType}
                onChange={(e) => setF("discountType", e.target.value)}
                style={INPUT}
              >
                <option value="flat">Flat (Rs.)</option>
                <option value="percent">Percentage (%)</option>
              </select>
            </div>
            <div>
              <label style={LABEL}>Discount Value</label>
              <input
                type="number"
                min="0"
                value={form.discountValue}
                onChange={(e) => setF("discountValue", e.target.value)}
                style={INPUT}
              />
            </div>
            <div>
              <label style={LABEL}>GST (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.gstPercent}
                onChange={(e) => setF("gstPercent", e.target.value)}
                style={INPUT}
              />
            </div>
          </div>
        </div>

        <div className="bt-card" style={{ background: "#f8fafc" }}>
          <div className="bt-title">Summary</div>
          {[
            ["Subtotal", fmtMoney(subtotal)],
            ["Discount", "\u2212 " + fmtMoney(discountAmount)],
            ["GST", "+ " + fmtMoney(gstAmount)],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "13px",
                color: "#475569",
                marginBottom: "6px",
              }}
            >
              <span>{k}</span>
              <span>{v}</span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "16px",
              fontWeight: 800,
              color: "#1e293b",
              borderTop: "2px solid #e5e7eb",
              paddingTop: "8px",
              marginTop: "6px",
            }}
          >
            <span>Total</span>
            <span style={{ color: "#1e40af" }}>{fmtMoney(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* payment details */}
      <div className="bt-card" style={{ marginTop: "14px" }}>
        <div className="bt-title">Payment Details</div>
        <div className="bt-gp">
          <div>
            <label style={LABEL}>Payment Method</label>
            <select
              value={form.paymentMethod}
              onChange={(e) => setF("paymentMethod", e.target.value)}
              style={INPUT}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={LABEL}>Amount Paid (Rs.)</label>
            <input
              type="number"
              min="0"
              value={form.amountPaid}
              onChange={(e) => setF("amountPaid", e.target.value)}
              style={INPUT}
            />
          </div>
          <div>
            <label style={LABEL}>Amount Due</label>
            <input
              readOnly
              value={fmtMoney(amountDue)}
              style={{
                ...INPUT,
                background: "#fef2f2",
                fontWeight: 700,
                color: amountDue > 0 ? "#dc2626" : "#16a34a",
              }}
            />
          </div>
          <div>
            <label style={LABEL}>Payment Date</label>
            <input
              type="date"
              value={form.paymentDate}
              onChange={(e) => setF("paymentDate", e.target.value)}
              style={INPUT}
            />
          </div>
          <div>
            <label style={LABEL}>Receipt No.</label>
            <input
              value={form.receiptNumber}
              onChange={(e) => setF("receiptNumber", e.target.value)}
              placeholder="e.g. RCP-001"
              style={INPUT}
            />
          </div>
          {form.paymentMethod === "upi" && (
            <div>
              <label style={LABEL}>UPI ID</label>
              <input
                value={form.upiId}
                onChange={(e) => setF("upiId", e.target.value)}
                placeholder="name@upi"
                style={INPUT}
              />
            </div>
          )}
        </div>
      </div>

      {/* insurance */}
      <div className="bt-card" style={{ marginTop: "14px" }}>
        <div className="bt-title">Insurance (Optional)</div>
        <div className="bt-g3">
          <div>
            <label style={LABEL}>Insurance Provider</label>
            <input
              value={form.insuranceProvider}
              onChange={(e) => setF("insuranceProvider", e.target.value)}
              placeholder="Provider name"
              style={INPUT}
            />
          </div>
          <div>
            <label style={LABEL}>Claim Number</label>
            <input
              value={form.insuranceClaimNo}
              onChange={(e) => setF("insuranceClaimNo", e.target.value)}
              placeholder="Claim no."
              style={INPUT}
            />
          </div>
          <div>
            <label style={LABEL}>Claim Status</label>
            <select
              value={form.insuranceStatus}
              onChange={(e) => setF("insuranceStatus", e.target.value)}
              style={INPUT}
            >
              <option value="">Not Applicable</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* notes */}
      <div className="bt-card" style={{ marginTop: "14px" }}>
        <label style={LABEL}>Notes / Remarks</label>
        <textarea
          value={form.notes}
          onChange={(e) => setF("notes", e.target.value)}
          placeholder="Any additional notes..."
          rows={3}
          style={{ ...INPUT, resize: "vertical" }}
        />
      </div>

      {/* bottom save bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          marginTop: "20px",
          flexWrap: "wrap",
        }}
      >
        <button onClick={onCancel} className="bt-btn-ghost">
          Cancel
        </button>
        {saveBtn}
      </div>
    </div>
  );
}

// ── Invoice List Row ──────────────────────────────────────────
function InvoiceRow({ inv, onEdit, onDelete, onShare }) {
  const cfg = STATUS_CFG[inv.paymentStatus] || STATUS_CFG.unpaid;
  return (
    <div className="bt-row" style={{ borderLeft: "4px solid " + cfg.color }}>
      {/* top: invoice no + patient + amount */}
      <div className="bt-row-top">
        <div className="bt-row-invno">
          <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>
            Invoice No.
          </div>
          <div style={{ fontWeight: 700, fontSize: "13px", color: "#1e40af" }}>
            {inv.invoiceNumber}
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "1px" }}>
            {friendlyDate(inv.invoiceDate)}
          </div>
        </div>
        <div className="bt-row-patient">
          <div style={{ fontWeight: 700, fontSize: "14px", color: "#1e293b" }}>
            {inv.patientName}
          </div>
          <div style={{ fontSize: "12px", color: "#64748b" }}>
            {inv.patientPhone}
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "1px" }}>
            Dr. {inv.doctorName}
          </div>
        </div>
        <div className="bt-row-right">
          <div style={{ fontWeight: 800, fontSize: "15px", color: "#1e293b" }}>
            {fmtMoney(inv.totalAmount)}
          </div>
          {(inv.amountDue || 0) > 0 && (
            <div
              style={{ fontSize: "11px", color: "#dc2626", fontWeight: 600 }}
            >
              Due: {fmtMoney(inv.amountDue)}
            </div>
          )}
        </div>
      </div>

      {/* middle: services + status badge */}
      <div className="bt-row-mid">
        <div className="bt-row-services" style={{ flex: 1 }}>
          {(inv.items || [])
            .map((i) => i.treatment)
            .join(", ")
            .slice(0, 70) || "--"}
        </div>
        <span
          style={{
            padding: "2px 10px",
            borderRadius: "12px",
            background: cfg.bg,
            color: cfg.color,
            border: "1px solid " + cfg.color,
            fontSize: "11px",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {cfg.label}
        </span>
      </div>

      {/* actions */}
      <div className="bt-row-actions">
        <button
          onClick={() => onShare(inv)}
          title={"Send invoice PDF to " + inv.patientName + " via WhatsApp"}
          className="bt-wa-btn"
        >
          Send on WhatsApp
        </button>
        <button onClick={() => onEdit(inv)} className="bt-edit-btn">
          Edit
        </button>
        <button onClick={() => onDelete(inv._id)} className="bt-del-btn">
          Del
        </button>
      </div>
    </div>
  );
}

// ── Summary Cards ─────────────────────────────────────────────
function SummaryCards({ summary }) {
  if (!summary) return null;
  const cards = [
    {
      label: "Total Revenue",
      value: fmtMoney(summary.totalRevenue),
      color: "#16a34a",
    },
    {
      label: "This Month",
      value: fmtMoney(summary.monthlyRevenue),
      color: "#2563eb",
    },
    {
      label: "This Week",
      value: fmtMoney(summary.weeklyRevenue),
      color: "#7c3aed",
    },
    { label: "Today", value: fmtMoney(summary.dailyRevenue), color: "#0891b2" },
    {
      label: "Outstanding Dues",
      value: fmtMoney(summary.totalOutstanding),
      color: "#dc2626",
    },
    { label: "Unpaid Invoices", value: summary.unpaidCount, color: "#dc2626" },
    { label: "Partial", value: summary.partialCount, color: "#d97706" },
    { label: "Paid", value: summary.paidCount, color: "#16a34a" },
  ];
  return (
    <div className="bt-summary">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bt-summary-card"
          style={{ borderTop: "3px solid " + c.color }}
        >
          <div className="bt-summary-val" style={{ color: c.color }}>
            {c.value}
          </div>
          <div className="bt-summary-lbl">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Main BillingTab ───────────────────────────────────────────
export default function BillingTab({ showNotify, doctor }) {
  const [view, setView] = useState("list");
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [sharingInv, setSharingInv] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPatient, setFilterPatient] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [inv, pat, sum] = await Promise.all([
        api.get("/billing"),
        api.get("/billing/patients"),
        api.get("/billing/summary"),
      ]);
      setInvoices(Array.isArray(inv) ? inv : []);
      setPatients(Array.isArray(pat) ? pat : []);
      setSummary(sum);
    } catch (err) {
      showNotify("Error", err.message, true);
    }
    setLoading(false);
  }, [showNotify]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this invoice permanently?")) return;
    try {
      await api.delete("/billing/" + id);
      setInvoices((prev) => prev.filter((i) => i._id !== id));
      showNotify("Deleted", "Invoice removed.");
      load();
    } catch (err) {
      showNotify("Error", err.message, true);
    }
  };

  const handleEdit = (inv) => {
    setEditing(inv);
    setView("edit");
  };
  const handleNew = () => {
    setEditing(null);
    setView("new");
  };
  const handleSaved = () => {
    setView("list");
    setEditing(null);
    load();
  };

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    return (
      (!q ||
        (inv.patientName || "").toLowerCase().includes(q) ||
        (inv.invoiceNumber || "").toLowerCase().includes(q) ||
        (inv.patientPhone || "").includes(q)) &&
      (filterStatus === "all" || inv.paymentStatus === filterStatus) &&
      (!filterPatient || inv.patientId === filterPatient)
    );
  });

  // patient totals for billing history widget
  const patientTotals = {};
  invoices.forEach((inv) => {
    if (!patientTotals[inv.patientId]) {
      patientTotals[inv.patientId] = {
        name: inv.patientName,
        total: 0,
        count: 0,
      };
    }
    patientTotals[inv.patientId].total += inv.totalAmount || 0;
    patientTotals[inv.patientId].count += 1;
  });

  // render form view
  if (view === "new" || view === "edit") {
    return (
      <div className="bt-wrap">
        <InvoiceForm
          patients={patients}
          doctor={doctor}
          invoice={view === "edit" ? editing : null}
          onSave={handleSaved}
          onCancel={() => setView("list")}
          showNotify={showNotify}
        />
      </div>
    );
  }

  // render list view
  return (
    <div className="bt-wrap">
      <BillingStyles />

      {/* Invoice share modal — appears exactly like PrescriptionModal */}
      {sharingInv && (
        <InvoiceShareModal
          inv={sharingInv}
          onClose={() => setSharingInv(null)}
          showNotify={showNotify}
        />
      )}

      <SummaryCards summary={summary} />

      {/* search + filters */}
      <div className="bt-filter">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient, invoice number, phone..."
          style={INPUT}
          className="bt-filter-search"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={INPUT}
          className="bt-filter-select"
        >
          <option value="all">All Statuses</option>
          {Object.keys(STATUS_CFG).map((k) => (
            <option key={k} value={k}>
              {STATUS_CFG[k].label}
            </option>
          ))}
        </select>
        <select
          value={filterPatient}
          onChange={(e) => setFilterPatient(e.target.value)}
          style={INPUT}
          className="bt-filter-select"
        >
          <option value="">All Patients</option>
          {patients.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
        <div className="bt-filter-btns">
          <button onClick={load} className="bt-btn-ghost">
            Refresh
          </button>
          <button onClick={handleNew} className="bt-btn">
            + New Invoice
          </button>
        </div>
      </div>

      {/* invoice list */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "#94a3b8",
            fontSize: "15px",
          }}
        >
          Loading invoices...
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            background: "#f8fafc",
            borderRadius: "10px",
            color: "#94a3b8",
            fontSize: "14px",
            border: "1px dashed #e2e8f0",
          }}
        >
          No invoices found. Click &ldquo;+ New Invoice&rdquo; to create one.
        </div>
      ) : (
        <>
          <div
            style={{
              fontSize: "12px",
              color: "#94a3b8",
              marginBottom: "10px",
              fontWeight: 600,
            }}
          >
            Showing {filtered.length} invoice(s)
          </div>
          {filtered.map((inv) => (
            <InvoiceRow
              key={inv._id}
              inv={inv}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onShare={(i) => setSharingInv(i)}
            />
          ))}
        </>
      )}

      {/* patient billing history */}
      {Object.keys(patientTotals).length > 0 && (
        <div className="bt-card" style={{ marginTop: "28px" }}>
          <div className="bt-title">Patient Billing History</div>
          <div className="bt-pat-hist">
            {Object.entries(patientTotals)
              .sort((a, b) => b[1].total - a[1].total)
              .map(([pid, data]) => (
                <div
                  key={pid}
                  onClick={() => setFilterPatient(pid)}
                  style={{
                    background: "#f8fafc",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    cursor: "pointer",
                    border: "1px solid #e5e7eb",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#2563eb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "13px",
                      color: "#1e293b",
                    }}
                  >
                    {data.name}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginTop: "3px",
                    }}
                  >
                    {data.count} invoice(s)
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 800,
                      color: "#1e40af",
                      marginTop: "4px",
                    }}
                  >
                    {fmtMoney(data.total)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* top billed treatments */}
      {summary && (summary.topServices || []).length > 0 && (
        <div className="bt-card" style={{ marginTop: "16px" }}>
          <div className="bt-title">Top Billed Treatments</div>
          {summary.topServices.map((s, i) => {
            const pct = Math.round(
              (s.amount / (summary.topServices[0].amount || 1)) * 100,
            );
            return (
              <div key={s.name || i} style={{ marginBottom: "10px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    marginBottom: "4px",
                  }}
                >
                  <span style={{ color: "#334155", fontWeight: 500 }}>
                    {s.name}
                  </span>
                  <span style={{ color: "#1e40af", fontWeight: 700 }}>
                    {fmtMoney(s.amount)}
                  </span>
                </div>
                <div
                  style={{
                    background: "#e5e7eb",
                    borderRadius: "20px",
                    height: "6px",
                  }}
                >
                  <div
                    style={{
                      background: "#1e40af",
                      borderRadius: "20px",
                      height: "6px",
                      width: pct + "%",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
