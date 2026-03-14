// ============================================================
// src/components/admin/PatientsTab.js
// ============================================================
import React, { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";

const SERVICES_LIST = [
  "General Checkup & Cleaning",
  "Cosmetic Dentistry / Smile Makeover",
  "Dental Implants",
  "Orthodontics / Invisalign",
  "Root Canal Therapy",
  "Pediatric Dentistry",
  "Oral Surgery",
  "Periodontal Treatment",
  "Teeth Whitening",
  "Emergency Dental Care",
  "Follow-Up Visit",
  "Other",
];

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
const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function fmtDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
}

function fmtDateShort(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.getDate() + " " + MONTHS_SHORT[d.getMonth()] + " " + d.getFullYear();
}

function fmtTime(t) {
  if (!t) return "";
  const parts = t.split(":");
  const hh = parseInt(parts[0]),
    mm = parts[1];
  return (hh % 12 || 12) + ":" + mm + " " + (hh < 12 ? "AM" : "PM");
}

function totalRevenue(visits = []) {
  return visits.reduce((sum, v) => {
    const n = parseFloat((v.amount || "0").toString().replace(/[^0-9.]/g, ""));
    return sum + (isNaN(n) ? 0 : n);
  }, 0);
}

export default function PatientsTab({ showNotify, doctor }) {
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newPat, setNewPat] = useState({
    name: "",
    mobile: "",
    email: "",
    age: "",
    gender: "",
    blood: "",
  });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [rxModal, setRxModal] = useState(null);

  const today = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toTimeString().slice(0, 5);
  const [visitForm, setVisitForm] = useState({
    date: today,
    time: nowTime,
    service: "",
    amount: "",
    nextVisitDate: "",
    notes: "",
  });

  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get("/patients");
      setPatients(data);
      setFiltered(data);
    } catch (err) {
      showNotify("Error", err.message, true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const filterPatients = (q) => {
    const term = q.toLowerCase();
    setFiltered(
      patients.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(term) ||
          (p.mobile || "").includes(term) ||
          (p.email || "").toLowerCase().includes(term),
      ),
    );
  };

  const createPatient = async () => {
    if (!newPat.name.trim()) {
      showNotify("Error", "Patient name is required.", true);
      return;
    }
    if (!newPat.mobile.trim()) {
      showNotify("Error", "Mobile number is required.", true);
      return;
    }
    try {
      await api.post("/patients", newPat);
      setNewPat({
        name: "",
        mobile: "",
        email: "",
        age: "",
        gender: "",
        blood: "",
      });
      setShowNewForm(false);
      showNotify(
        "Patient Profile Created! ✓",
        "New profile for " + newPat.name + " saved.",
      );
      loadPatients();
    } catch (err) {
      showNotify("Error", err.message, true);
    }
  };

  const openPatient = async (p) => {
    try {
      const full = await api.get("/patients/" + p._id);
      setSelectedPatient(full);
      setVisitForm({
        date: today,
        time: nowTime,
        service: "",
        amount: "",
        nextVisitDate: "",
        notes: "",
      });
    } catch (err) {
      showNotify("Error", err.message, true);
    }
  };

  const deletePatient = async () => {
    if (
      !window.confirm(
        "Delete this patient profile and all their records? This cannot be undone.",
      )
    )
      return;
    try {
      await api.delete("/patients/" + selectedPatient._id);
      showNotify("Profile Deleted", "Patient profile removed.");
      setSelectedPatient(null);
      loadPatients();
    } catch (err) {
      showNotify("Error", err.message, true);
    }
  };

  const saveVisit = async () => {
    if (!visitForm.date) {
      showNotify("Missing Fields", "Please select a visit date.", true);
      return;
    }
    if (!visitForm.service) {
      showNotify("Missing Fields", "Please select a service.", true);
      return;
    }
    try {
      const payload = {
        visitDate: visitForm.date,
        visitTime: visitForm.time,
        service: visitForm.service,
        amount: visitForm.amount,
        nextVisitDate: visitForm.nextVisitDate,
        notes: visitForm.notes,
        doctor: doctor?.name || "",
        prescription: { medicineRows: [] },
      };
      const updated = await api.post(
        "/patients/" + selectedPatient._id + "/visits",
        payload,
      );
      setSelectedPatient(updated);
      setVisitForm({
        date: today,
        time: nowTime,
        service: "",
        amount: "",
        nextVisitDate: "",
        notes: "",
      });

      // Follow-up WhatsApp if notes contain "follow-up" and nextVisitDate is set
      const isFollowUp = /follow[\s\-]?up/i.test(visitForm.notes);
      if (isFollowUp && visitForm.nextVisitDate && selectedPatient.mobile) {
        let rawMobile = (selectedPatient.mobile || "").replace(
          /[\s\-\(\)\+]/g,
          "",
        );
        if (!rawMobile.startsWith("91") && rawMobile.length === 10)
          rawMobile = "91" + rawMobile;
        const waMsg = `*PearlSmile Dental Hospital* — Follow-Up Reminder\n\nDear ${selectedPatient.name},\nThis is a reminder for your follow-up appointment.\n\n*Service:* ${visitForm.service}\n*Next Visit:* ${fmtDate(visitForm.nextVisitDate)}\n\nPlease call us to confirm your appointment.\n📞 +91 87936 08083`;
        setTimeout(
          () =>
            window.open(
              "https://wa.me/" +
                rawMobile +
                "?text=" +
                encodeURIComponent(waMsg),
              "_blank",
            ),
          500,
        );
        showNotify(
          "Visit Saved + Follow-Up WhatsApp Sent!",
          "Reminder sent to " +
            selectedPatient.name +
            " for " +
            fmtDate(visitForm.nextVisitDate) +
            ".",
        );
      } else {
        showNotify(
          "Visit Record Saved! ✓",
          "Patient visit has been recorded successfully.",
        );
      }
      loadPatients();
    } catch (err) {
      showNotify("Error", err.message, true);
    }
  };

  const deleteVisit = async (visitId) => {
    if (!window.confirm("Delete this visit record?")) return;
    try {
      const result = await api.delete(
        "/patients/" + selectedPatient._id + "/visits/" + visitId,
      );
      setSelectedPatient(result.patient);
      showNotify("Visit Deleted", "Visit record removed.");
      loadPatients();
    } catch (err) {
      showNotify("Error", err.message, true);
    }
  };

  const sendPrescription = (visit) => {
    setRxModal({ visit, patient: selectedPatient, doctor });
  };

  // ── LIST VIEW ─────────────────────────────────────────────────
  if (!selectedPatient) {
    return (
      <div>
        <div className="admin-section-title">Patient Profiles</div>
        <div className="admin-section-desc">
          Create and manage individual patient profiles. Click a profile to view
          visit history and add new records.
        </div>

        <div className="patients-list-view">
          <input
            type="text"
            className="patient-search-bar"
            placeholder="🔍 Search patients by name or phone..."
            onChange={(e) => filterPatients(e.target.value)}
          />

          {showNewForm && (
            <div className="new-patient-form">
              <h4>➕ Create New Patient Profile</h4>
              <div className="new-patient-grid">
                {[
                  ["name", "text", "Full Name *", "Patient full name"],
                  ["mobile", "tel", "Mobile Number *", "+91 98765 43210"],
                  ["email", "email", "Email Address", "patient@email.com"],
                  ["age", "number", "Age", "Age"],
                ].map(([k, t, label, ph]) => (
                  <div key={k}>
                    <div className="admin-row-label">{label}</div>
                    <input
                      type={t}
                      placeholder={ph}
                      value={newPat[k]}
                      onChange={(e) =>
                        setNewPat((p) => ({ ...p, [k]: e.target.value }))
                      }
                    />
                  </div>
                ))}
                <div>
                  <div className="admin-row-label">Gender</div>
                  <select
                    value={newPat.gender}
                    onChange={(e) =>
                      setNewPat((p) => ({ ...p, gender: e.target.value }))
                    }
                  >
                    <option value="">Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <div className="admin-row-label">Blood Group</div>
                  <input
                    type="text"
                    placeholder="e.g. B+"
                    value={newPat.blood}
                    onChange={(e) =>
                      setNewPat((p) => ({ ...p, blood: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="add-visit-save-btn" onClick={createPatient}>
                  💾 Save Patient Profile
                </button>
                <button
                  className="btn-back-patients"
                  onClick={() => setShowNewForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 13, color: "var(--gray-400)" }}>
              {loading
                ? "Loading patients..."
                : `${filtered.length} patient profile${filtered.length !== 1 ? "s" : ""}`}
            </div>
            <button
              className="admin-add-btn"
              onClick={() => setShowNewForm((s) => !s)}
            >
              {showNewForm ? "Cancel" : "+ New Patient Profile"}
            </button>
          </div>

          <div className="patient-profiles-grid">
            {loading ? (
              <div
                style={{
                  color: "var(--gray-400)",
                  fontSize: 14,
                  padding: "20px 0",
                  gridColumn: "1/-1",
                }}
              >
                Loading...
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  color: "var(--gray-400)",
                  fontSize: 14,
                  padding: "24px 0",
                  gridColumn: "1/-1",
                  textAlign: "center",
                }}
              >
                No patients yet. Click "+ New Patient Profile" to add your first
                patient.
              </div>
            ) : (
              filtered.map((p) => (
                <div
                  key={p._id}
                  className="patient-profile-card"
                  onClick={() => openPatient(p)}
                >
                  <div className="patient-avatar-icon">🧑‍⚕️</div>
                  <div className="patient-card-name">{p.name}</div>
                  <div className="patient-card-id">📞 {p.mobile || "—"}</div>
                  <div className="patient-card-visits">
                    📋 {p.visitCount || 0} visit{p.visitCount !== 1 ? "s" : ""}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── DETAIL VIEW ───────────────────────────────────────────────
  const p = selectedPatient;
  const visits = p.visits || [];
  const total = totalRevenue(visits);

  return (
    <div>
      <div className="patient-detail-view open">
        <div className="patient-detail-header">
          <button
            className="btn-back-patients"
            onClick={() => setSelectedPatient(null)}
          >
            ← Back to Patients
          </button>
          <div
            className="patient-avatar-icon"
            style={{ width: 56, height: 56, fontSize: 26 }}
          >
            🧑‍⚕️
          </div>
          <div style={{ flex: 1 }}>
            <h3>{p.name}</h3>
            <p style={{ fontSize: 13, color: "var(--gray-400)" }}>
              {p.email}
              {p.email && p.mobile ? " · " : ""}
              {p.mobile}
            </p>
            <div className="patient-info-row">
              {[
                p.age ? "Age: " + p.age : null,
                p.gender || null,
                p.blood ? "Blood: " + p.blood : null,
              ]
                .filter(Boolean)
                .map((t, i) => (
                  <span key={i} className="patient-info-pill">
                    {t}
                  </span>
                ))}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div
              style={{
                fontSize: 11,
                color: "var(--gray-400)",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Total Revenue
            </div>
            <div
              style={{
                fontFamily: "Cormorant Garamond,serif",
                fontSize: 26,
                fontWeight: 600,
                color: "var(--teal)",
                lineHeight: 1,
              }}
            >
              Rs. {total.toLocaleString("en-IN")}
            </div>
            <div
              style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 2 }}
            >
              {visits.length} visit{visits.length !== 1 ? "s" : ""}
            </div>
          </div>
          <button
            className="admin-del-btn"
            onClick={deletePatient}
            style={{ alignSelf: "flex-start", marginTop: 4 }}
          >
            🗑️ Delete Profile
          </button>
        </div>

        {/* Add Visit Form — original simple layout */}
        <div className="add-visit-form">
          <h4>📋 Add New Visit Record</h4>
          <div className="add-visit-grid">
            <div>
              <div className="admin-row-label">Visit Date *</div>
              <input
                type="date"
                value={visitForm.date}
                onChange={(e) =>
                  setVisitForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>
            <div>
              <div className="admin-row-label">Visit Time</div>
              <input
                type="time"
                value={visitForm.time}
                onChange={(e) =>
                  setVisitForm((f) => ({ ...f, time: e.target.value }))
                }
              />
            </div>
            <div>
              <div className="admin-row-label">Service Taken *</div>
              <select
                value={visitForm.service}
                onChange={(e) =>
                  setVisitForm((f) => ({ ...f, service: e.target.value }))
                }
              >
                <option value="">Select Service</option>
                {SERVICES_LIST.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="admin-row-label">Amount Charged (Rs.)</div>
              <input
                type="text"
                placeholder="e.g. 2500"
                value={visitForm.amount}
                onChange={(e) =>
                  setVisitForm((f) => ({ ...f, amount: e.target.value }))
                }
              />
            </div>
            <div>
              <div
                className="admin-row-label"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                Next Date to Visit
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--teal)",
                    fontWeight: 400,
                    background: "rgba(13,115,119,0.08)",
                    padding: "2px 8px",
                    borderRadius: 100,
                    border: "1px solid rgba(13,115,119,0.2)",
                  }}
                >
                  For follow-up
                </span>
              </div>
              <input
                type="date"
                value={visitForm.nextVisitDate}
                onChange={(e) =>
                  setVisitForm((f) => ({ ...f, nextVisitDate: e.target.value }))
                }
                style={{ marginTop: 6 }}
              />
            </div>
          </div>
          <div className="admin-row-label" style={{ marginBottom: 6 }}>
            Doctor Notes / Diagnosis
          </div>
          <textarea
            value={visitForm.notes}
            onChange={(e) =>
              setVisitForm((f) => ({ ...f, notes: e.target.value }))
            }
            placeholder="Enter observations, treatment given, prescription, follow-up advice... (type 'follow-up' to trigger WhatsApp reminder on Next Date to Visit)"
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 4,
            }}
          >
            <button className="add-visit-save-btn" onClick={saveVisit}>
              💾 Save Visit Record
            </button>
          </div>
        </div>

        {/* Visit History */}
        <div style={{ marginBottom: 12 }}>
          <div className="admin-section-title" style={{ marginBottom: 8 }}>
            Visit History
          </div>
          <div className="visit-records-list">
            {visits.length === 0 ? (
              <div
                style={{
                  color: "var(--gray-400)",
                  fontSize: 13,
                  padding: "10px 0",
                }}
              >
                No visits recorded yet. Add the first visit above.
              </div>
            ) : (
              visits.map((v, i) => {
                const dtStr =
                  (v.visitDate || "") +
                  (v.visitTime ? " at " + v.visitTime : "");
                const isFollowUp = /follow[\s\-]?up/i.test(v.notes || "");
                return (
                  <div key={v._id || i} className="visit-record-card">
                    <button
                      className="visit-del-btn"
                      onClick={() => deleteVisit(v._id)}
                      title="Delete"
                    >
                      ✕
                    </button>
                    <div className="visit-record-meta">
                      <span className="visit-record-service">
                        {v.service || "Visit"}
                      </span>
                      <span className="visit-record-date">📅 {dtStr}</span>
                      {v.amount && (
                        <span
                          className="patient-info-pill"
                          style={{ fontSize: 11 }}
                        >
                          Rs. {v.amount}
                        </span>
                      )}
                    </div>
                    <div className="visit-record-notes">{v.notes || "—"}</div>
                    {v.nextVisitDate && (
                      <div
                        style={{
                          marginTop: 8,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          background: isFollowUp
                            ? "rgba(201,168,76,0.12)"
                            : "rgba(13,115,119,0.08)",
                          border:
                            "1px solid " +
                            (isFollowUp
                              ? "rgba(201,168,76,0.35)"
                              : "rgba(13,115,119,0.2)"),
                          borderRadius: 100,
                          padding: "3px 12px",
                          fontSize: 12,
                          fontWeight: 500,
                          color: isFollowUp ? "#8b6914" : "var(--teal)",
                        }}
                      >
                        {isFollowUp ? "Follow-Up: " : "Next Visit: "}
                        {fmtDateShort(v.nextVisitDate)}
                        {isFollowUp ? " — WhatsApp sent" : ""}
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 10,
                      }}
                    >
                      <button
                        onClick={() => sendPrescription(v)}
                        style={{
                          background: "linear-gradient(135deg,#0a1628,#1a3a6b)",
                          color: "white",
                          border: "none",
                          borderRadius: 7,
                          padding: "7px 14px",
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: "pointer",
                          fontFamily: "'DM Sans',sans-serif",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          transition: "opacity 0.2s",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.opacity = "0.85")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.opacity = "1")
                        }
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="white"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.556 4.126 1.526 5.857L0 24l6.335-1.508A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.807 9.807 0 0 1-5.028-1.382l-.36-.214-3.732.888.939-3.618-.235-.372A9.808 9.808 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
                        </svg>
                        Send Prescription
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {rxModal && (
        <PrescriptionModal
          visit={rxModal.visit}
          patient={rxModal.patient}
          doctor={rxModal.doctor}
          onClose={() => setRxModal(null)}
          showNotify={showNotify}
        />
      )}
    </div>
  );
}

// ── Prescription Modal — exact original PDF design ────────────
function PrescriptionModal({ visit, patient, doctor, onClose, showNotify }) {
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [rxMobile, setRxMobile] = useState("");
  const [fileName, setFileName] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    generatePDF();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const fmtDateLocal = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
  };

  const fmtTimeLocal = (t) => {
    if (!t) return "";
    const parts = t.split(":");
    const hh = parseInt(parts[0]),
      mm = parts[1];
    return (hh % 12 || 12) + ":" + mm + " " + (hh < 12 ? "AM" : "PM");
  };

  const generatePDF = () => {
    if (window.jspdf) {
      buildPDF();
      return;
    }
    const existing = document.getElementById("jspdf-cdn");
    if (existing) {
      existing.addEventListener("load", buildPDF);
      return;
    }
    const script = document.createElement("script");
    script.id = "jspdf-cdn";
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.crossOrigin = "anonymous";
    script.onload = buildPDF;
    script.onerror = () => setLoading(false);
    document.head.appendChild(script);
  };

  const buildPDF = () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });
    const W = 210,
      H = 297;

    const sf = (c) => pdf.setFillColor(c[0], c[1], c[2]);
    const sd = (c) => pdf.setDrawColor(c[0], c[1], c[2]);
    const st = (c) => pdf.setTextColor(c[0], c[1], c[2]);

    const NAVY = [8, 25, 65],
      BLUE = [20, 80, 160],
      BLUE2 = [40, 110, 190];
    const LBLUE = [210, 228, 248],
      LBLUE2 = [232, 242, 252],
      MIDBLUE = [160, 195, 235];
    const TEAL = [0, 130, 130],
      TEAL2 = [210, 240, 240];
    const WHITE = [255, 255, 255],
      LGRAY = [245, 247, 251],
      LGRAY2 = [250, 251, 254],
      LGRAY3 = [240, 243, 248];
    const GRAY = [115, 118, 130],
      GRAY2 = [75, 80, 95];
    const GOLD = [170, 130, 40],
      GOLD2 = [250, 245, 225];

    const today = new Date();
    const todayFmt =
      today.getDate() +
      " " +
      MONTHS[today.getMonth()] +
      " " +
      today.getFullYear();
    const rxNum =
      "PS-" +
      today.getFullYear() +
      ("0" + (today.getMonth() + 1)).slice(-2) +
      ("0" + today.getDate()).slice(-2) +
      "-" +
      Math.floor(1000 + Math.random() * 8999);

    const visitDate = visit.visitDate || "";
    const visitTime = visit.visitTime || "";
    const notes = visit.notes || "";
    const nextDate = visit.nextVisitDate || "";
    const service = visit.service || "";
    const doc = { name: doctor?.name || "Doctor", qual: "", reg: "" };

    const visitDateFmt = fmtDateLocal(visitDate);
    const visitTimeFmt = fmtTimeLocal(visitTime);
    const nextDateFmt = fmtDateLocal(nextDate);

    // ── Outer border ─────────────────────────────────────────────
    sd(MIDBLUE);
    pdf.setLineWidth(0.8);
    pdf.rect(3.5, 3.5, W - 7, H - 7, "S");
    sd(LBLUE);
    pdf.setLineWidth(0.3);
    pdf.rect(5.5, 5.5, W - 11, H - 11, "S");

    // ── Header ───────────────────────────────────────────────────
    sf(NAVY);
    pdf.rect(3.5, 3.5, W - 7, 46, "F");
    sf(BLUE);
    pdf.rect(3.5, 43, W - 7, 10, "F");
    sf(LBLUE);
    pdf.rect(3.5, 53, W - 7, 6, "F");

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
    pdf.text("Reg. No.:  " + (doc.reg || "—"), 14, 33.5);
    pdf.text("Specialisation:  Dental & Oral Health Care", 14, 38.5);

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

    st(WHITE);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text("DIGITAL PRESCRIPTION", W / 2, 50, { align: "center" });
    st(LBLUE2);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.text("Rx No.: " + rxNum, 10, 50);
    pdf.text("Date: " + todayFmt, W - 10, 50, { align: "right" });

    st(BLUE);
    pdf.setFontSize(7.5);
    pdf.setFont("helvetica", "bold");
    pdf.text("PATIENT INFORMATION", W / 2, 57, { align: "center" });

    // ── Patient info table ────────────────────────────────────────
    const infoTop = 61;
    sf(LGRAY3);
    pdf.rect(10, infoTop, W - 20, 44, "F");
    sd(LBLUE);
    pdf.setLineWidth(0.25);
    pdf.rect(10, infoTop, W - 20, 44, "S");
    sd(MIDBLUE);
    pdf.setLineWidth(0.2);
    pdf.line(W / 2, infoTop, W / 2, infoTop + 44);
    let rdy = infoTop + 11;
    for (let ri = 0; ri < 3; ri++) {
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
      const val = pdf.splitTextToSize(String(value || "—"), maxW || 75);
      pdf.text(val[0], x + 3, y + 9.5);
    };
    const cHalf = W / 2;
    drawCell("PATIENT NAME", patient.name || "—", 10, infoTop, cHalf - 16);
    drawCell("MOBILE", patient.mobile || "—", cHalf, infoTop, cHalf - 16);
    drawCell("EMAIL", patient.email || "—", 10, infoTop + 11, cHalf - 16);
    drawCell(
      "BLOOD GROUP",
      patient.blood || "—",
      cHalf,
      infoTop + 11,
      cHalf - 16,
    );
    drawCell(
      "AGE / GENDER",
      (patient.age || "—") + (patient.gender ? "  |  " + patient.gender : ""),
      10,
      infoTop + 22,
      cHalf - 16,
    );
    drawCell(
      "VISIT DATE",
      visitDateFmt + (visitTimeFmt ? " (" + visitTimeFmt + ")" : ""),
      cHalf,
      infoTop + 22,
      cHalf - 16,
    );
    drawCell("SERVICE/TREATMENT", service || "—", 10, infoTop + 33, cHalf - 16);
    drawCell(
      "NEXT VISIT DATE",
      nextDateFmt || "—",
      cHalf,
      infoTop + 33,
      cHalf - 16,
    );

    // ── Clinical Notes ────────────────────────────────────────────
    const diagTop = infoTop + 50;
    sf(BLUE);
    pdf.rect(10, diagTop, W - 20, 8, "F");
    st(WHITE);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.text(
      "Rx   CLINICAL NOTES / DIAGNOSIS & PRESCRIPTION",
      14,
      diagTop + 5.5,
    );
    st(GOLD);
    pdf.setFontSize(10);
    pdf.text("Rx", W - 16, diagTop + 5.5, { align: "right" });

    const notesBoxH = 56;
    sf(LGRAY2);
    pdf.rect(10, diagTop + 8, W - 20, notesBoxH, "F");
    sd(LBLUE);
    pdf.setLineWidth(0.25);
    pdf.rect(10, diagTop + 8, W - 20, notesBoxH, "S");
    sd([215, 225, 240]);
    pdf.setLineWidth(0.15);
    for (let rl = 0; rl < 7; rl++)
      pdf.line(14, diagTop + 16 + rl * 7, W - 14, diagTop + 16 + rl * 7);
    st(NAVY);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.5);
    const noteLines = pdf.splitTextToSize(
      notes || "No diagnosis or notes recorded for this visit.",
      W - 30,
    );
    pdf.text(noteLines, 14, diagTop + 15);

    // ── Next appointment box ──────────────────────────────────────
    let afterY = diagTop + notesBoxH + 10;
    if (nextDateFmt) {
      sf(TEAL2);
      pdf.roundedRect(10, afterY, W - 20, 13, 2, 2, "F");
      sd(TEAL);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(10, afterY, W - 20, 13, 2, 2, "S");
      sf(TEAL);
      pdf.roundedRect(10, afterY, 10, 13, 2, 2, "F");
      st(WHITE);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6.5);
      pdf.text("NEXT", 11.2, afterY + 5.5);
      pdf.text("VISIT", 11.0, afterY + 10);
      st(TEAL);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text("Next Appointment:", 24, afterY + 6.5);
      st(NAVY);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text(nextDateFmt, 72, afterY + 6.5);
      st(GRAY);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "italic");
      pdf.text(
        "Please arrive 10 minutes early and bring this prescription.",
        24,
        afterY + 11,
      );
      afterY += 19;
    }

    // ── General advice box ────────────────────────────────────────
    const advY = afterY + 4;
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
    pdf.setFont("helvetica", "bold");
    pdf.text("General Advice:", 24, advY + 6.5);
    st(GRAY2);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.text(
      "1.  Follow all prescribed medicines on time and complete the full course.",
      24,
      advY + 11.5,
    );
    pdf.text(
      "2.  Maintain good oral hygiene. Brush gently twice daily.",
      24,
      advY + 15.5,
    );
    pdf.text(
      "3.  Avoid very hot, cold, or hard foods until fully healed.",
      24,
      advY + 19.2,
    );

    // ── Watermark ─────────────────────────────────────────────────
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.035 }));
    st(NAVY);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(44);
    pdf.text("PEARLSMILE", W / 2, H / 2 - 5, { align: "center", angle: 35 });
    pdf.restoreGraphicsState();

    // ── Doctor seal ───────────────────────────────────────────────
    const sigY = Math.max(advY + 28, H - 55);
    const INK = [28, 52, 140],
      INK2 = [45, 75, 170];
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
        const ao = (si * 4 * Math.PI) / 5 - Math.PI / 2,
          ai = ao + (2 * Math.PI) / 5;
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

    const docShort = (doc.name || "Doctor").toUpperCase();
    sd(INK);
    st(INK);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(5.8);
    const topSpan = Math.min(docShort.length * 0.19, 1.3);
    const topStart = -Math.PI / 2 - topSpan / 2;
    for (let ti = 0; ti < docShort.length; ti++) {
      const ta = topStart + (ti / Math.max(docShort.length - 1, 1)) * topSpan;
      const tx = cx + (R - 1.5) * Math.cos(ta),
        ty = cy + (R - 1.5) * Math.sin(ta);
      const trot = ((ta + Math.PI / 2) * 180) / Math.PI;
      pdf.text(docShort[ti], tx, ty, { align: "center", angle: -trot });
    }

    pdf.setFontSize(5.5);
    const botStr = "PEARLSMILE DENTAL";
    const botSpan = Math.min(botStr.length * 0.175, 1.4);
    const botStart = Math.PI / 2 - botSpan / 2;
    for (let bi = 0; bi < botStr.length; bi++) {
      const ba = botStart + (bi / Math.max(botStr.length - 1, 1)) * botSpan;
      const bx = cx + (R - 1.5) * Math.cos(ba),
        by = cy + (R - 1.5) * Math.sin(ba);
      const brot = ((ba - Math.PI / 2) * 180) / Math.PI;
      pdf.text(botStr[bi], bx, by, { align: "center", angle: -brot });
    }

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

    st(INK);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(4.5);
    pdf.text("Reg. " + (doc.reg || "—"), cx, cy + R - 5.5, { align: "center" });
    st(INK2);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.5);
    pdf.text("Authorised Signatory", cx, cy + R + 4, { align: "center" });

    st(GRAY);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.text("Rx No.: " + rxNum, 14, sigY + 30);
    pdf.text("Date: " + todayFmt, W - 14, sigY + 30, { align: "right" });

    // ── Footer ────────────────────────────────────────────────────
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
      "This is a computer-generated prescription from PearlSmile Dental Hospital. Valid only with authorised doctor details.",
      W / 2,
      H - 5.5,
      { align: "center" },
    );

    // ── Output ────────────────────────────────────────────────────
    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);
    const name =
      "Prescription_" +
      (patient.name || "Patient").replace(/\s+/g, "_") +
      "_" +
      visitDate +
      ".pdf";

    let rawMob = (patient.mobile || "").replace(/[\s\-\(\)\+]/g, "");
    if (!rawMob.startsWith("91") && rawMob.length === 10)
      rawMob = "91" + rawMob;

    setPdfBlob(blob);
    setPdfUrl(url);
    setRxMobile(rawMob);
    setFileName(name);
    // Show native share button only if Web Share API supports files — exactly like original HTML
    const testFile = new File([blob], name, { type: "application/pdf" });
    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [testFile] })
    ) {
      setCanNativeShare(true);
    }
    setLoading(false);
  };

  const downloadPDF = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = fileName;
    link.click();
  };

  const openFullPreview = () => {
    if (pdfUrl) window.open(pdfUrl, "_blank");
  };

  const shareViaWhatsApp = () => {
    if (rxMobile) window.open("https://wa.me/" + rxMobile, "_blank");
    showNotify(
      "WhatsApp Opened!",
      "Attach the PDF from the preview and send to patient.",
    );
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
          title: "Digital Prescription — PearlSmile Dental Hospital",
          text: "",
          files: [file],
        })
        .then(() => {
          showNotify("Shared!", "Prescription shared successfully.");
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
        {/* Header */}
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
                Digital Prescription Ready
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 12,
                  fontFamily: "DM Sans,sans-serif",
                }}
              >
                {patient.name} · {visit.visitDate}
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
            ✕
          </button>
        </div>

        {/* PDF Preview */}
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
                Generating PDF…
              </div>
            </div>
          )}
          {pdfUrl && (
            <iframe
              title="prescription"
              src={pdfUrl}
              style={{ width: "100%", height: 420, border: "none" }}
            />
          )}
        </div>

        {/* Action buttons — exactly like original HTML */}
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
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#e5e0d8")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#f0eeeb")}
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
              🔍 Open Full PDF
            </button>
            {canNativeShare && (
              <button
                onClick={nativeShare}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#e5e0d8")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "#f0eeeb")
                }
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
                📤 Share (Device)
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
            On mobile: tap "Share (Device)" to send directly via WhatsApp.
            <br />
            On desktop: use "Open Full PDF" to view, then share manually.
          </p>
        </div>
      </div>
    </div>
  );
}
