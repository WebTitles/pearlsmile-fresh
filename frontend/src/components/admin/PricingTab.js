// ============================================================
// src/components/admin/PricingTab.js
// ============================================================
import React, { useState, useEffect } from "react";
import api from "../../utils/api";

const DEFAULT_PRICING = [
  {
    icon: "🦷",
    name: "Essential Care",
    price: "Rs. 500",
    from: true,
    featured: false,
    features: [
      "Oral Examination",
      "Professional Cleaning",
      "X-Ray (2 films)",
      "Cavity Check",
      "Treatment Plan",
      "Follow-up Reminder",
    ],
  },
  {
    icon: "⭐",
    name: "Smile Makeover",
    price: "Rs. 3,500",
    from: true,
    featured: true,
    features: [
      "Teeth Whitening (1 hr)",
      "Composite Bonding",
      "Gum Contouring",
      "Digital Smile Design",
      "Post-care Kit",
      "3-Month Follow-up",
    ],
  },
  {
    icon: "💎",
    name: "Implant Package",
    price: "Rs. 25,000",
    from: true,
    featured: false,
    features: [
      "Titanium Implant",
      "3D Cone Beam CT Scan",
      "Custom Crown",
      "Bone Grafting (if needed)",
      "Lifetime Warranty",
      "Priority Scheduling",
    ],
  },
];

export default function PricingTab({ showNotify }) {
  const [pricing, setPricing] = useState([]);
  const [priceToast, setPriceToast] = useState(false);

  useEffect(() => {
    api
      .get("/pricing")
      .then((data) => setPricing(data?.length > 0 ? data : DEFAULT_PRICING))
      .catch(() => setPricing(DEFAULT_PRICING));
  }, []);

  const update = (i, key, val) => {
    setPricing((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, [key]: val } : p)),
    );
  };

  const updateFeatures = (i, textareaVal) => {
    update(
      i,
      "features",
      textareaVal.split("\n").filter((l) => l.trim()),
    );
  };

  const addRow = () => {
    setPricing((prev) => [
      ...prev,
      {
        icon: "🦷",
        name: "New Package",
        price: "Rs. 0",
        from: true,
        featured: false,
        features: ["Feature 1", "Feature 2", "Feature 3"],
      },
    ]);
    showNotify(
      "Pricing Card Added",
      "Fill in the details and click Save & Update Live.",
    );
  };

  const deleteRow = (i) => {
    if (window.confirm("Delete this pricing card?")) {
      setPricing((prev) => prev.filter((_, idx) => idx !== i));
    }
  };

  const save = async () => {
    try {
      await api.put("/pricing", { list: pricing });
      // Immediately refresh the front page Pricing section
      if (typeof window.__refreshPricing === "function")
        window.__refreshPricing();
      showNotify(
        "Pricing Saved! ✓",
        "Pricing cards updated and live on the website.",
      );
      setPriceToast(true);
      setTimeout(() => setPriceToast(false), 3000);
    } catch (err) {
      showNotify("Save Failed", err.message, true);
    }
  };

  return (
    <div>
      <div className="admin-section-title">Pricing Editor</div>
      <div className="admin-section-desc">
        Edit pricing cards. Click "Save & Update Live" to update the Pricing
        section instantly.
      </div>
      <div className="admin-pricing-list">
        {pricing.map((p, i) => (
          <div className="admin-pricing-row" key={i}>
            <div>
              <div className="admin-row-label">Package Name</div>
              <input
                type="text"
                value={p.name}
                onChange={(e) => update(i, "name", e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1.5px solid var(--gray-200)",
                  borderRadius: 8,
                  fontFamily: "DM Sans,sans-serif",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>
            <div>
              <div className="admin-row-label">Icon (emoji)</div>
              <input
                type="text"
                value={p.icon}
                onChange={(e) => update(i, "icon", e.target.value)}
                style={{
                  width: 80,
                  padding: "10px 14px",
                  border: "1.5px solid var(--gray-200)",
                  borderRadius: 8,
                  fontFamily: "DM Sans,sans-serif",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>
            <div>
              <div className="admin-row-label">Starting Price</div>
              <input
                type="text"
                value={p.price}
                onChange={(e) => update(i, "price", e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1.5px solid var(--gray-200)",
                  borderRadius: 8,
                  fontFamily: "DM Sans,sans-serif",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginTop: 20,
              }}
            >
              <label className="admin-featured-toggle">
                <input
                  type="checkbox"
                  checked={!!p.featured}
                  onChange={(e) => update(i, "featured", e.target.checked)}
                />{" "}
                Mark as Featured
              </label>
              <button className="admin-del-btn" onClick={() => deleteRow(i)}>
                ✕
              </button>
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <div className="admin-row-label">Features (one per line)</div>
              <textarea
                value={(p.features || []).join("\n")}
                onChange={(e) => updateFeatures(i, e.target.value)}
                style={{
                  width: "100%",
                  height: 110,
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
          + Add Pricing Card
        </button>
        <button className="admin-save-btn" onClick={save}>
          Save & Update Live →
        </button>
        <span className={`admin-saved-toast${priceToast ? " show" : ""}`}>
          ✅ Changes saved and live!
        </span>
      </div>
    </div>
  );
}
