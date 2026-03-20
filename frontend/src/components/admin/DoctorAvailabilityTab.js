// ============================================================
// src/components/admin/DoctorAvailabilityTab.js
// ============================================================
import React, { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";

export default function DoctorAvailabilityTab({ showNotify }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null); // id of doctor being toggled

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get("/auth/doctors");
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      showNotify("Error", err.message, true);
    }
    setLoading(false);
  }, [showNotify]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (doctor) => {
    setToggling(doctor._id);
    try {
      const updated = await api.patch(
        `/auth/doctors/${doctor._id}/availability`,
        { isAvailable: !doctor.isAvailable }
      );
      setDoctors((prev) =>
        prev.map((d) => (d._id === updated._id ? updated : d))
      );
      showNotify(
        "Updated",
        `${updated.name} is now ${updated.isAvailable ? "Available ✅" : "Unavailable ❌"}`
      );
    } catch (err) {
      showNotify("Error", err.message, true);
    }
    setToggling(null);
  };

  return (
    <div style={{ padding: "0 0 40px" }}>

      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px",
      }}>
        <div>
          <h3 style={{ margin: 0, color: "#1e293b", fontSize: "17px" }}>
            Doctor Availability
          </h3>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "13px" }}>
            Toggle to mark doctors as available or unavailable today.
            Patients will see this on the appointment page.
          </p>
        </div>
        <button
          onClick={load}
          style={{
            padding: "8px 16px", borderRadius: "8px", background: "#f1f5f9",
            color: "#374151", border: "1px solid #d1d5db",
            fontSize: "13px", fontWeight: 600, cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
          Loading doctors...
        </div>
      ) : doctors.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "40px", background: "#f8fafc",
          borderRadius: "10px", color: "#94a3b8", border: "1px dashed #e2e8f0",
        }}>
          No doctors found.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {doctors.map((doc) => (
            <div
              key={doc._id}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderLeft: `4px solid ${doc.isAvailable ? "#16a34a" : "#dc2626"}`,
                borderRadius: "10px",
                padding: "16px 20px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                opacity: doc.isAvailable ? 1 : 0.75,
              }}
            >
              {/* Doctor info */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{
                  width: "46px", height: "46px", borderRadius: "50%",
                  background: doc.isAvailable ? "#dcfce7" : "#fee2e2",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px", flexShrink: 0,
                }}>
                  🩺
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "#1e293b" }}>
                    {doc.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                    {doc.specialty || "General Dentist"}
                  </div>
                  <div style={{ marginTop: "4px" }}>
                    <span style={{
                      padding: "2px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 700,
                      background: doc.isAvailable ? "#f0fdf4" : "#fef2f2",
                      color:      doc.isAvailable ? "#16a34a" : "#dc2626",
                      border:     `1px solid ${doc.isAvailable ? "#16a34a" : "#dc2626"}`,
                    }}>
                      {doc.isAvailable ? "✅ Available Today" : "❌ Unavailable Today"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>
                  {doc.isAvailable ? "Mark as Unavailable" : "Mark as Available"}
                </span>
                <button
                  onClick={() => handleToggle(doc)}
                  disabled={toggling === doc._id}
                  style={{
                    width: "52px", height: "28px",
                    borderRadius: "14px", border: "none", cursor: "pointer",
                    background: doc.isAvailable ? "#16a34a" : "#d1d5db",
                    position: "relative", transition: "background 0.25s",
                    opacity: toggling === doc._id ? 0.6 : 1,
                  }}
                  title={doc.isAvailable ? "Click to mark unavailable" : "Click to mark available"}
                >
                  <span style={{
                    position: "absolute",
                    top: "3px",
                    left: doc.isAvailable ? "26px" : "3px",
                    width: "22px", height: "22px",
                    borderRadius: "50%", background: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    transition: "left 0.25s",
                  }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info box */}
      <div style={{
        marginTop: "24px", padding: "14px 18px",
        background: "#eff6ff", border: "1px solid #bfdbfe",
        borderRadius: "10px", fontSize: "13px", color: "#1e40af",
      }}>
        <strong>💡 How it works:</strong> When you mark a doctor as unavailable,
        patients will see them greyed out on the appointment page with an
        "Unavailable Today" label. Available doctors are shown normally in green.
        Changes are instant and live.
      </div>
    </div>
  );
}
