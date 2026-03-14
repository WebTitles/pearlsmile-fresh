// ============================================================
// src/components/admin/ServicesTab.js
// ============================================================
import React, { useState, useEffect } from "react";
import api from "../../utils/api";

const DEFAULT_SERVICES = [
  {
    icon: "🦷",
    name: "General Dentistry & Cleaning",
    desc: "Comprehensive oral examinations, professional cleanings, cavity detection, and preventive care.",
    price: "Rs. 500",
    from: true,
  },
  {
    icon: "✨",
    name: "Cosmetic Dentistry & Smile Makeover",
    desc: "Transform your smile with veneers, bonding, whitening, and complete makeover packages.",
    price: "Rs. 3,500",
    from: true,
  },
  {
    icon: "🔩",
    name: "Dental Implants",
    desc: "Permanent tooth replacements using titanium implants.",
    price: "Rs. 25,000",
    from: true,
  },
  {
    icon: "📐",
    name: "Orthodontics & Invisalign",
    desc: "Traditional braces and clear aligner solutions.",
    price: "Rs. 18,000",
    from: true,
  },
  {
    icon: "💉",
    name: "Root Canal Therapy",
    desc: "Painless root canal treatments.",
    price: "Rs. 4,000",
    from: true,
  },
  {
    icon: "👶",
    name: "Pediatric Dentistry",
    desc: "Gentle, child-friendly dental care.",
    price: "Rs. 400",
    from: true,
  },
];

export default function ServicesTab({ showNotify }) {
  const [services, setServices] = useState([]);
  const [svcToast, setSvcToast] = useState(false);

  useEffect(() => {
    api
      .get("/services")
      .then((data) => setServices(data?.length > 0 ? data : DEFAULT_SERVICES))
      .catch(() => setServices(DEFAULT_SERVICES));
  }, []);

  const update = (i, key, val) => {
    setServices((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, [key]: val } : s)),
    );
  };

  const addRow = () => {
    setServices((prev) => [
      ...prev,
      {
        icon: "🦷",
        name: "New Service",
        desc: "Description.",
        price: "Rs. 0",
        from: true,
      },
    ]);
    showNotify(
      "Service Added",
      "Fill in the details and click Save & Update Live.",
    );
  };

  const deleteRow = (i) => {
    if (window.confirm("Delete this service?")) {
      setServices((prev) => prev.filter((_, idx) => idx !== i));
    }
  };

  const save = async () => {
    try {
      await api.put("/services", { list: services });
      // Immediately refresh the front page Services section
      if (typeof window.__refreshServices === "function")
        window.__refreshServices();
      showNotify(
        "Services Saved! ✓",
        "All services updated and live on the website.",
      );
      setSvcToast(true);
      setTimeout(() => setSvcToast(false), 3000);
    } catch (err) {
      showNotify("Save Failed", err.message, true);
    }
  };

  return (
    <div>
      <div className="admin-section-title">Services Editor</div>
      <div className="admin-section-desc">
        Add, edit or remove services. Click "Save & Update Live" to reflect
        changes instantly.
      </div>
      <div className="admin-services-list">
        {services.map((s, i) => (
          <div className="admin-service-row" key={i}>
            <div>
              <div className="admin-row-label">Icon</div>
              <input
                type="text"
                value={s.icon}
                onChange={(e) => update(i, "icon", e.target.value)}
                style={{ width: 70 }}
              />
            </div>
            <div>
              <div className="admin-row-label">Service Name</div>
              <input
                type="text"
                value={s.name}
                onChange={(e) => update(i, "name", e.target.value)}
              />
            </div>
            <div style={{ gridColumn: "span 1" }}>
              <div className="admin-row-label">Description</div>
              <textarea
                value={s.desc}
                onChange={(e) => update(i, "desc", e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1.5px solid var(--gray-200)",
                  borderRadius: 8,
                  fontFamily: "DM Sans,sans-serif",
                  fontSize: 13,
                  resize: "vertical",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <div className="admin-row-label">Price (e.g. Rs. 500)</div>
              <input
                type="text"
                value={s.price}
                onChange={(e) => update(i, "price", e.target.value)}
              />
            </div>
            <div>
              <div className="admin-row-label">Actions</div>
              <button className="admin-del-btn" onClick={() => deleteRow(i)}>
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <button className="admin-add-btn" onClick={addRow}>
          + Add New Service
        </button>
        <button className="admin-save-btn" onClick={save}>
          Save & Update Live →
        </button>
        <span className={`admin-saved-toast${svcToast ? " show" : ""}`}>
          ✅ Changes saved and live!
        </span>
      </div>
    </div>
  );
}
