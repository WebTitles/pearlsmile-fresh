// ============================================================
// src/components/admin/PrescriptionModal.js
// ============================================================
import React, { useEffect, useRef, useState } from "react";

export default function PrescriptionModal({ visit, patient, doctor, onClose }) {
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const pdfBlobRef = useRef(null);

  useEffect(() => {
    generatePDF();
  }, []);

  const fmtDate = (d) => {
    if (!d) return "";
    const nd = new Date(d + "T00:00:00");
    return nd.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  };

  const generatePDF = () => {
    if (window.jspdf) { buildPDF(); return; }
    const existing = document.getElementById("jspdf-cdn");
    if (existing) { existing.addEventListener("load", buildPDF); return; }
    const script = document.createElement("script");
    script.id = "jspdf-cdn";
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.crossOrigin = "anonymous";
    script.onload = buildPDF;
    script.onerror = () => setLoading(false);
    document.head.appendChild(script);
  };

  const buildPDF = () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const W = pdf.internal.pageSize.getWidth();
    const H = pdf.internal.pageSize.getHeight();

    const NAVY = [10, 22, 40];
    const TEAL = [13, 115, 119];
    const TEAL2 = [20, 160, 165];
    const GOLD = [201, 168, 76];
    const GOLD2 = [255, 248, 220];
    const WHITE = [255, 255, 255];
    const GRAY = [90, 85, 80];
    const GRAY2 = [60, 57, 54];
    const CREAM = [248, 245, 240];

    const st = (c) => pdf.setTextColor(c[0], c[1], c[2]);
    const sf = (c) => pdf.setFillColor(c[0], c[1], c[2]);
    const sd = (c) => pdf.setDrawColor(c[0], c[1], c[2]);

    // ── HEADER ────────────────────────────────────────────────
    sf(NAVY);
    pdf.rect(0, 0, W, 38, "F");
    sf(TEAL);
    pdf.rect(0, 35, W, 3, "F");

    // Logo circle
    sf(TEAL2);
    pdf.circle(17, 16, 9, "F");
    sf(WHITE);
    pdf.circle(17, 16, 6, "F");
    sf(TEAL);
    pdf.circle(17, 16, 3.5, "F");

    // Hospital name
    st(WHITE);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("PearlSmile", 30, 13);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setCharSpace(2);
    st(GOLD);
    pdf.text("DENTAL HOSPITAL", 31, 19);
    pdf.setCharSpace(0);

    st([180, 200, 220]);
    pdf.setFontSize(7);
    pdf.text("12, Dental Plaza, MG Road, Pune – 411001", 30, 25);
    pdf.text("+91 98765 43210  |  care@pearlsmiledental.in", 30, 30);

    // Right side - Rx symbol & date
    st(WHITE);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(32);
    pdf.text("Rx", W - 28, 22);
    st([100, 160, 200]);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    pdf.text("Date: " + today, W - 10, 30, { align: "right" });

    // ── PATIENT DETAILS ───────────────────────────────────────
    let y = 46;
    sf(CREAM);
    pdf.roundedRect(8, y, W - 16, 22, 3, 3, "F");
    sd(TEAL);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(8, y, W - 16, 22, 3, 3, "S");

    sf(TEAL);
    pdf.roundedRect(8, y, 22, 22, 3, 3, "F");
    st(WHITE);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6);
    pdf.text("PATIENT", 10.5, y + 8.5);
    pdf.text("DETAILS", 10.5, y + 13);

    st(NAVY);
    pdf.setFontSize(13);
    pdf.text(patient.name || "—", 35, y + 9);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    st(GRAY);
    const infoLine = [
      patient.age ? "Age: " + patient.age : null,
      patient.gender || null,
      patient.blood ? "Blood: " + patient.blood : null,
      patient.mobile ? "📞 " + patient.mobile : null,
    ].filter(Boolean).join("   |   ");
    pdf.text(infoLine, 35, y + 16);

    // Visit info on right
    st(TEAL);
    pdf.setFontSize(7);
    pdf.text("Visit: " + fmtDate(visit.visitDate) + (visit.visitTime ? " at " + visit.visitTime : ""), W - 12, y + 9, { align: "right" });
    pdf.text("Service: " + (visit.service || ""), W - 12, y + 14, { align: "right" });
    if (visit.toothNumbers) pdf.text("Tooth: " + visit.toothNumbers, W - 12, y + 19, { align: "right" });

    // ── DOCTOR HEADER ─────────────────────────────────────────
    y += 28;
    st(TEAL);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.text("TREATING DOCTOR:", 12, y);
    st(NAVY);
    pdf.setFontSize(11);
    pdf.text(doctor.name || "—", 12, y + 6);
    st(GRAY);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.text("PearlSmile Dental Hospital", 12, y + 11);

    sd(TEAL);
    pdf.setLineWidth(0.3);
    pdf.line(10, y + 15, W - 10, y + 15);
    y += 20;

    // ── DIAGNOSIS / NOTES ─────────────────────────────────────
    if (visit.notes) {
      sf([235, 248, 250]);
      pdf.roundedRect(10, y, W - 20, 18, 2, 2, "F");
      sf(TEAL);
      pdf.roundedRect(10, y, 10, 18, 2, 2, "F");
      st(WHITE);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6);
      pdf.text("DX", 11.5, y + 8);
      pdf.text(".", 11.5, y + 12);
      st(TEAL);
      pdf.setFontSize(7.5);
      pdf.text("Diagnosis / Clinical Notes:", 24, y + 6.5);
      st(NAVY);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      const lines = pdf.splitTextToSize(visit.notes, W - 48);
      pdf.text(lines.slice(0, 2), 24, y + 12);
      y += 22;
    }

    // ── MEDICINES ─────────────────────────────────────────────
    const meds = visit.prescription?.medicineRows?.filter(r => r.name?.trim()) || [];
    if (meds.length > 0) {
      sf(NAVY);
      pdf.roundedRect(10, y, W - 20, 8, 2, 2, "F");
      st(WHITE);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text("PRESCRIPTION", 12, y + 5.5);
      st(GOLD);
      pdf.text("Rx", W - 14, y + 5.5);
      y += 10;

      meds.forEach((med, idx) => {
        const bg = idx % 2 === 0 ? WHITE : CREAM;
        sf(bg);
        pdf.rect(10, y, W - 20, 10, "F");
        sd([220, 215, 210]);
        pdf.setLineWidth(0.2);
        pdf.rect(10, y, W - 20, 10, "S");

        // Number badge
        sf(TEAL);
        pdf.circle(16, y + 5, 3.5, "F");
        st(WHITE);
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "bold");
        pdf.text(String(idx + 1), 16, y + 6.5, { align: "center" });

        // Medicine name
        st(NAVY);
        pdf.setFontSize(9);
        pdf.text(med.name || "", 22, y + 4.5);
        if (med.dose) {
          st(TEAL);
          pdf.setFontSize(7);
          pdf.setFont("helvetica", "normal");
          pdf.text(med.dose, 22, y + 8.5);
        }
        // Frequency
        if (med.freq) {
          st(GRAY);
          pdf.setFontSize(7.5);
          pdf.text(med.freq, W / 2, y + 5.5);
        }
        // Duration
        if (med.duration) {
          st(NAVY);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(8);
          pdf.text(med.duration, W - 12, y + 5.5, { align: "right" });
        }
        y += 10;
      });
      y += 4;
    }

    // ── NEXT VISIT ────────────────────────────────────────────
    if (visit.nextVisitDate) {
      sf(GOLD2);
      pdf.roundedRect(10, y, W - 20, 16, 2, 2, "F");
      sd(GOLD);
      pdf.setLineWidth(0.35);
      pdf.roundedRect(10, y, W - 20, 16, 2, 2, "S");
      sf(GOLD);
      pdf.roundedRect(10, y, 10, 16, 2, 2, "F");
      st(WHITE);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(5.5);
      pdf.text("NEXT", 11.3, y + 6.5);
      pdf.text("VISIT", 11.3, y + 11.5);
      st(NAVY);
      pdf.setFontSize(9);
      pdf.text("Next Appointment:", 24, y + 6.5);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      st(TEAL);
      pdf.text(fmtDate(visit.nextVisitDate), 72, y + 6.5);
      st(GRAY);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "italic");
      pdf.text("Please arrive 10 minutes early and bring this prescription.", 24, y + 11);
      y += 19;
    }

    // ── GENERAL ADVICE ────────────────────────────────────────
    const advY = y + 4;
    sf(GOLD2);
    pdf.roundedRect(10, advY, W - 20, 20, 2, 2, "F");
    sd(GOLD);
    pdf.setLineWidth(0.35);
    pdf.roundedRect(10, advY, W - 20, 20, 2, 2, "S");
    sf(GOLD);
    pdf.roundedRect(10, advY, 10, 20, 2, 2, "F");
    st(WHITE);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6.2);
    pdf.text("GEN.", 11.2, advY + 8);
    pdf.text("ADV.", 11.2, advY + 13.5);
    st(GOLD);
    pdf.setFontSize(7.5);
    pdf.text("General Advice:", 24, advY + 6.5);
    st(GRAY2);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.text("1.  Follow all prescribed medicines on time and complete the full course.", 24, advY + 11.5);
    pdf.text("2.  Maintain good oral hygiene. Brush gently twice daily.", 24, advY + 15.5);
    pdf.text("3.  Avoid very hot, cold, or hard foods until fully healed.", 24, advY + 19.2);

    // ── WATERMARK ─────────────────────────────────────────────
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.035 }));
    st(NAVY);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(44);
    pdf.text("PEARLSMILE", W / 2, H / 2 - 5, { align: "center", angle: 35 });
    pdf.restoreGraphicsState();

    // ── DOCTOR SEAL ───────────────────────────────────────────
    const sigY = Math.max(advY + 28, H - 55);
    const INK = [28, 52, 140];
    const cx = W - 46, cy = sigY + 13, R = 18;
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
        pts.push({ x: sx + sr * 0.4 * Math.cos(ai), y: sy + sr * 0.4 * Math.sin(ai) });
      }
      pdf.setLineWidth(0.3);
      sd(INK); sf(INK);
      pdf.lines(pts.slice(1).map((pt, i) => [pt.x - pts[i].x, pt.y - pts[i].y]), pts[0].x, pts[0].y, [1,1], "FD", true);
    };
    drawStar(cx - R + 3.5, cy + 1, 2.2);
    drawStar(cx + R - 3.5, cy + 1, 2.2);

    // Doctor name arc
    const docShort = (doctor.name || "Doctor").toUpperCase();
    sd(INK); st(INK);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(5.8);
    const topStr = docShort;
    const topArcR = R - 1.5;
    const topSpan = Math.min(topStr.length * 0.19, 1.3);
    const topStart = -Math.PI / 2 - topSpan / 2;
    for (let ti = 0; ti < topStr.length; ti++) {
      const ta = topStart + (ti / Math.max(topStr.length - 1, 1)) * topSpan;
      const tx = cx + topArcR * Math.cos(ta);
      const ty = cy + topArcR * Math.sin(ta);
      const trot = ((ta + Math.PI / 2) * 180) / Math.PI;
      pdf.text(topStr[ti], tx, ty, { align: "center", angle: -trot });
    }

    pdf.setFontSize(5.5);
    const botStr = "PEARLSMILE DENTAL";
    const botArcR = R - 1.5;
    const botSpan = Math.min(botStr.length * 0.175, 1.4);
    const botStart = Math.PI / 2 - botSpan / 2;
    for (let bi = 0; bi < botStr.length; bi++) {
      const ba = botStart + (bi / Math.max(botStr.length - 1, 1)) * botSpan;
      const bx = cx + botArcR * Math.cos(ba);
      const by = cy + botArcR * Math.sin(ba);
      const brot = ((ba - Math.PI / 2) * 180) / Math.PI;
      pdf.text(botStr[bi], bx, by, { align: "center", angle: -brot });
    }

    // Caduceus symbol
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

    // ── FOOTER ────────────────────────────────────────────────
    const footerY = H - 12;
    sf(NAVY);
    pdf.rect(0, footerY - 2, W, 14, "F");
    st([100, 160, 200]);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.text("PearlSmile Dental Hospital  ·  12, Dental Plaza, MG Road, Pune 411001", W / 2, footerY + 3, { align: "center" });
    st(GOLD);
    pdf.text("+91 98765 43210  ·  care@pearlsmiledental.in", W / 2, footerY + 7, { align: "center" });

    // Generate blob URL
    const blob = pdf.output("blob");
    pdfBlobRef.current = blob;
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
    setLoading(false);
  };

  const downloadPDF = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `PearlSmile_Rx_${patient.name?.replace(/\s+/g,"_")}_${visit.visitDate}.pdf`;
    link.click();
  };

  const sharePDF = async () => {
    if (pdfBlobRef.current && navigator.share) {
      const file = new File([pdfBlobRef.current], `PearlSmile_Rx_${patient.name}.pdf`, { type: "application/pdf" });
      await navigator.share({ files: [file], title: "PearlSmile Prescription" });
    } else {
      downloadPDF();
    }
  };

  return (
    <div
      className="rx-share-overlay open"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:540, boxShadow:"0 24px 80px rgba(0,0,0,0.45)", overflow:"hidden", display:"flex", flexDirection:"column", maxHeight:"92vh" }}>
        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#0a1628,#1a3a6b)", padding:"18px 22px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:22 }}>📄</span>
            <div>
              <div style={{ color:"#fff", fontWeight:600, fontSize:15, fontFamily:"DM Sans,sans-serif" }}>Digital Prescription Ready</div>
              <div style={{ color:"rgba(255,255,255,0.55)", fontSize:12, fontFamily:"DM Sans,sans-serif" }}>{patient.name} — {visit.visitDate}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.12)", border:"none", color:"#fff", width:32, height:32, borderRadius:"50%", fontSize:17, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        {/* PDF Preview */}
        <div style={{ flex:1, overflow:"hidden", background:"#f0eeeb", minHeight:340, position:"relative" }}>
          {loading && (
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#f0eeeb", gap:10 }}>
              <div style={{ width:36, height:36, border:"3px solid #0d7377", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
              <div style={{ fontSize:13, color:"#5a5550", fontFamily:"DM Sans,sans-serif" }}>Generating PDF…</div>
            </div>
          )}
          {pdfUrl && <iframe title="prescription" src={pdfUrl} style={{ width:"100%", height:420, border:"none" }} />}
        </div>

        {/* Action buttons */}
        <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:10, background:"#fff" }}>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={downloadPDF} style={{ flex:1, background:"#f0eeeb", color:"#0a1628", border:"1.5px solid #ddd9d3", borderRadius:10, padding:10, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"DM Sans,sans-serif" }}>
              🔍 Open / Download PDF
            </button>
            <button onClick={sharePDF} style={{ flex:1, background:"#f0eeeb", color:"#0a1628", border:"1.5px solid #ddd9d3", borderRadius:10, padding:10, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"DM Sans,sans-serif" }}>
              📤 Share (Device)
            </button>
          </div>
          <p style={{ fontSize:11, color:"#9a9590", textAlign:"center", margin:0, fontFamily:"DM Sans,sans-serif", lineHeight:1.5 }}>
            On mobile: tap "Share (Device)" to send directly via WhatsApp.<br />On desktop: use "Open / Download PDF" to view, then share manually.
          </p>
        </div>
      </div>
    </div>
  );
}
