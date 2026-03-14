// ============================================================
// src/components/Pricing.js
// ============================================================
import React, { useState, useEffect, useCallback } from "react";
import api from "../utils/api";

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

export default function Pricing() {
  const [pricing, setPricing] = useState(DEFAULT_PRICING);

  const fetchPricing = useCallback(() => {
    api
      .get("/pricing")
      .then((data) => {
        if (data && data.length > 0) setPricing(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchPricing();
    // Refetch whenever the window regains focus (e.g. after saving in admin panel)
    window.addEventListener("focus", fetchPricing);
    return () => window.removeEventListener("focus", fetchPricing);
  }, [fetchPricing]);

  // Also expose a global trigger so AdminDashboard can call it after save
  useEffect(() => {
    window.__refreshPricing = fetchPricing;
    return () => {
      delete window.__refreshPricing;
    };
  }, [fetchPricing]);

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="pricing" id="pricing">
      <div className="pricing-bg" />
      <div className="pricing-header">
        <div className="section-tag">Transparent Pricing</div>
        <h2 className="section-title" style={{ color: "var(--white)" }}>
          Clear &amp; <em style={{ color: "var(--gold)" }}>Honest Pricing</em>
        </h2>
        <p className="section-desc">
          No hidden fees. No surprises. Just honest, transparent pricing for
          world-class dental care.
        </p>
      </div>
      <div className="pricing-grid">
        {pricing.map((p, i) => (
          <div
            className={`pricing-card${p.featured ? " featured" : ""}`}
            key={i}
          >
            <div className="pc-icon">{p.icon}</div>
            <div className="pc-name">{p.name}</div>
            <div className="pc-price">{p.price}</div>
            <div className="pc-from">
              {p.from ? "Starting price" : "Fixed price"}
            </div>
            <div className="pc-divider" />
            <ul className="pc-features">
              {(p.features || []).map((f, j) => (
                <li key={j}>{f}</li>
              ))}
            </ul>
            <button className="pc-btn" onClick={() => scrollTo("appointment")}>
              Book This Package
            </button>
          </div>
        ))}
      </div>
      <p className="pricing-note">
        * Prices are indicative. Final cost depends on clinical assessment. EMI
        &amp; insurance accepted.
      </p>
    </section>
  );
}
